---
title: Fine Tune
description: Yes, tokenization is the key step that turns your raw text data into a format compatible with fine-tuning—but it produces integer token IDs, not vector...
status: partial
---
**Yes, tokenization is the key step that turns your raw text data into a format compatible with fine-tuning—but it produces integer token IDs, *not* vector embeddings.** The embeddings happen later inside the model (via an `nn.Embedding` lookup table). Here's exactly how data preparation works for Qwen models (Qwen2 / Qwen2.5 / Qwen3) in a **tinygrad** workflow.

## 1. Start with raw text data (the easiest formats)
You need instruction / conversational data. The simplest and most compatible formats are:

- **Hugging Face datasets** (recommended for quick start)
  Examples that work great with Qwen:
  - `mlabonne/FineTome-100k`
  - `HuggingFaceH4/ultrachat_200k`
  - `teknium/OpenHermes-2.5`
  - Or any dataset with columns like `"messages"` (list of `{"role": "user/assistant", "content": "..."}`) or the classic Alpaca format (`"instruction"`, `"input"`, `"output"`).

- **Your own data** as a JSONL file (one JSON object per line):
  ```json
  {"messages": [{"role": "user", "content": "Explain tinygrad"}, {"role": "assistant", "content": "It's a tiny ML framework..."}]}
  ```

These are loaded with the `datasets` library (install `pip install datasets`).

## 2. Tokenization: text → integer token IDs (this is the serialization step)
Qwen models use a **tiktoken-style** tokenizer with special chat tokens (`&lt;|im_start|>`, `&lt;|im_end|>`, etc.). You **do not** create embeddings here—only IDs (0 to ~151,936 for Qwen2).

```python
from transformers import AutoTokenizer
import numpy as np
from datasets import load_dataset

tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2-0.5B-Instruct")  # or your Qwen model

# Load your dataset
dataset = load_dataset("mlabonne/FineTome-100k", split="train")

def tokenize_example(example):
    # Qwen chat template handles roles perfectly
    text = tokenizer.apply_chat_template(example["messages"], tokenize=False, add_generation_prompt=False)
    tokens = tokenizer.encode(text, add_special_tokens=False)
    return tokens

# Apply tokenization (this can take a while for big datasets)
tokenized = dataset.map(lambda x: {"tokens": tokenize_example(x)}, remove_columns=dataset.column_names)

# Flatten everything into one giant list of integers
all_tokens = []
for item in tokenized:
    all_tokens.extend(item["tokens"])

# Serialize to a tiny, fast binary format (this is what your training script will read)
tokens_array = np.array(all_tokens, dtype=np.uint32)  # uint32 is safe (vocab < 2^18)
tokens_array.tofile("train.bin")   # ~few hundred MB even for 100k examples
```

**Why `.bin` (flat uint32 array)?**
- It's the format used by every simple LLM trainer (nanoGPT, lit-gpt, the community tinygrad GPT-2 efforts, and OpenFormer).
- Super fast to `mmap` (memory-map) — no Python overhead.
- One file = entire dataset. You can shard it (`train_00.bin`, `train_01.bin`, …) if it gets > a few GB.

## 3. How the training script consumes the data (tinygrad style)
In your fine-tuning script (or in `kreasof-ai/OpenFormer`'s `train_sft.py`), you do this:

```python
import numpy as np
from tinygrad import Tensor

data = np.memmap("train.bin", dtype=np.uint32, mode="r")  # memory-mapped, zero-copy

def get_batch(batch_size=8, context_length=2048):
    starts = np.random.randint(0, len(data) - context_length - 1, batch_size)
    x = np.stack([data[i:i+context_length] for i in starts])      # inputs
    y = np.stack([data[i+1:i+context_length+1] for i in starts])  # targets (next token)
    return Tensor(x), Tensor(y)   # tinygrad Tensors — ready for .backward()
```

Then in your training loop (exactly like `beautiful_mnist.py` or the transformer example):
```python
for step in range(steps):
    X, Y = get_batch(...)
    with Tensor.train():
        logits = model(X)                # embedding layer turns IDs → vectors here
        loss = logits.sparse_categorical_crossentropy(Y)
        loss.backward()
        optimizer.step()
```

## 4. Bonus: Ready-made options (so you don't write everything from scratch)
- **Recommended**: Use **OpenFormer** (https://github.com/kreasof-ai/OpenFormer) — it's built *specifically* for tinygrad + Qwen/Llama3 fine-tuning.
  It already does the HF dataset + tokenizer + chat template + LoRA + SFT masking internally. Just run:
  ```bash
  python src/train_sft.py --model_id Qwen/Qwen2-0.5B-Instruct --dataset_id mlabonne/FineTome-100k
  ```
  You can still feed it your own `.bin` if you want.

- Official tinygrad has no LLM fine-tuning script yet (only inference in `llama.py`/`gpt2.py` and a toy `transformer.py`), but the community GPT-2 pre-training repos on Discord/Reddit use exactly the `.bin` + `memmap` pattern above.

## Quick checklist before you start fine-tuning
1. Install tokenizer deps: `pip install transformers datasets`
2. Run the tokenization script above → get `train.bin`
3. Use (or copy) a training script that expects `np.uint32` token sequences
4. For instruction tuning, always use `apply_chat_template` so Qwen sees the correct `&lt;|im_start|>` tokens
5. Mask loss on user/prompt tokens (OpenFormer does this automatically)

That's it — once you have the `.bin` file, the rest of the tinygrad workflow is literally the same as `beautiful_mnist.py`: define model, loss, optim, `.backward()`, `.step()`. No PyTorch DataLoader, no complicated packing, just raw token IDs in a binary file.

If you want, drop your dataset format (JSONL, HF name, etc.) and I can give you the exact 20-line tokenization script tailored to it. Happy fine-tuning! 🚀

**Here’s your ready-to-use, SGLang-style Dockerfile** for a GPU-accelerated tinygrad environment optimized for Qwen fine-tuning (and the exact workflow we discussed earlier).

It’s clean, production-ready, and includes:
- Latest stable NVIDIA CUDA 12.6 + cuDNN (devel base so everything just works)
- tinygrad installed editable from source
- **OpenFormer** (the best community trainer for tinygrad + Qwen/Llama) pre-installed and ready
- All the tokenization & data prep tools (transformers, datasets, tiktoken, etc.)
- HF cache volume mount support + huge shared memory (critical for large models)
- Pre-warmed tinygrad so the first run is fast

### Dockerfile (`Dockerfile.tinygrad-qwen`)

```dockerfile
FROM nvidia/cuda:12.6.0-cudnn-devel-ubuntu22.04

LABEL maintainer="tinygrad-qwen-finetune" \
      description="SGLang-style GPU environment for tinygrad + OpenFormer Qwen fine-tuning"

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    CUDA=1 \
    CUDA_HOME=/usr/local/cuda \
    PATH=/usr/local/cuda/bin:${PATH} \
    LD_LIBRARY_PATH=/usr/local/cuda/lib64:${LD_LIBRARY_PATH} \
    HF_HOME=/root/.cache/huggingface \
    PYTHONPATH=/app/tinygrad:/app/OpenFormer

# System deps
RUN apt-get update && apt-get install -y \
    git git-lfs \
    python3.11 python3.11-dev python3.11-venv python3-pip \
    build-essential curl htop nvtop nano \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3.11 /usr/bin/python3 \
    && ln -sf /usr/bin/python3.11 /usr/bin/python

WORKDIR /app

# Upgrade pip
RUN python -m pip install --no-cache-dir --upgrade pip wheel setuptools

# tinygrad from source
RUN git clone --depth 1 https://github.com/tinygrad/tinygrad.git && \
    cd tinygrad && \
    python -m pip install -e .

# OpenFormer (tinygrad-native SFT trainer — perfect for Qwen)
RUN git clone --depth 1 https://github.com/kreasof-ai/OpenFormer.git && \
    cd OpenFormer && \
    python -m pip install -e .[train] || python -m pip install -e .

# Fine-tuning & data prep stack
RUN python -m pip install --no-cache-dir \
    transformers \
    datasets \
    huggingface_hub[hf_transfer] \
    tiktoken \
    sentencepiece \
    tqdm \
    numpy \
    wandb \
    matplotlib

# Pre-warm tinygrad + print device (so you know CUDA is alive)
RUN python -c "
from tinygrad import Tensor, Device
print('✅ TinyGrad ready on device:', Device.DEFAULT)
import torch; print('✅ CUDA visible to transformers:', torch.cuda.is_available())
"

WORKDIR /workspace

CMD ["/bin/bash"]
```

## Build the image
```bash
docker build -t tinygrad-qwen:cu126 -f Dockerfile.tinygrad-qwen .
```

## Recommended run command (SGLang-style)
```bash
docker run --gpus all \
  --shm-size 64g \
  --ipc=host \
  -v $(pwd):/workspace \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -it tinygrad-qwen:cu126
```

## Inside the container — instant fine-tuning demo
```bash
# You are now in /workspace with everything pre-installed

# Example 1: Quick data prep + tokenization (from our previous script)
python -c "
from datasets import load_dataset
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained('Qwen/Qwen2-0.5B-Instruct')
dataset = load_dataset('mlabonne/FineTome-100k', split='train[:1%]')
# ... (your tokenization script here) → produces train.bin
"

# Example 2: Full SFT with OpenFormer (one-liner!)
cd /app/OpenFormer
python src/train_sft.py \
  --model_id Qwen/Qwen2-0.5B-Instruct \
  --dataset_id mlabonne/FineTome-100k \
  --context_length 2048 \
  --batch_size 4 \
  --steps 1000 \
  --save_dir /workspace/qwen-finetuned
```

## Why this is SGLang-style
- Minimal layers, no unnecessary bloat
- Huge `--shm-size` + `--ipc=host` (exactly what SGLang uses for high-throughput training)
- HF cache mounted so you don’t redownload models every time
- Editable installs (`-e .`) so you can hack on tinygrad/OpenFormer live
- Pre-warmed + device check on startup

You now have a reproducible, GPU-ready environment that matches exactly the data prep → `.bin` → training loop we talked about.

Want a lighter version (no OpenFormer, just tinygrad), a multi-stage build, or one that includes your custom training script as entrypoint? Just say the word and I’ll tweak it in 10 seconds.

Happy fine-tuning — this one flies on any NVIDIA GPU! 🚀
