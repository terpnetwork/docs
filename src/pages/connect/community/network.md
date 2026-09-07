---
title: Community network
description: Public hosts and how to show up as a peer
---

# Community network

Anyone can run a node on `morocco-1` or `120u-1`. Publish P2P as `id@host:26656` (or the Akash NodePort). Do not advertise a home validator — put [sentries](/guides/validators/sentry) in front.

Live RPC/REST/gRPC: [public endpoints](/resources/public). Install: [quickstart](/overview/quickstart).

Seed and persistent-peer lists change. Pull them from a host you already trust, or from your own synced node’s `net_info`, not from a screenshot in chat.

P2P is raw TCP. Do not put it behind an HTTP reverse proxy; see [nginx](/guides/nodes/nginx).

If you only need queries, skip P2P entirely and use the public RPC.
