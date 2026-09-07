// /**
//  * BrainGraph - Interactive knowledge graph explorer using vis-network
//  * Enhanced component with full wiki view matching brain.html experience
//  */
// 'use client';

// import { useEffect, useRef, useCallback, useState } from 'react';

// interface BrainNode {
//   id: string;
//   label: string;
//   type: string;
//   description: string;
//   group: string;
//   edges: number;
// }

// interface BrainEdge {
//   from: string;
//   to: string;
// }

// interface BrainNodeContent {
//   html: string;
//   frontmatter?: Record<string, any>;
// }

// interface DomainMap {
//   nodes: string[];
// }

// interface BrainData {
//   nodes: BrainNode[];
//   edges: BrainEdge[];
//   nodeContent: Record<string, BrainNodeContent>;
//   domainMaps: Record<string, DomainMap>;
// }

// declare global {
//   interface Window {
//     vis?: any;
//     BRAIN_DATA?: BrainData;
//   }
// }

// const TYPE_COLORS: Record<string, string> = {
//   concept: '#98e8c1',
//   procedure: '#50fa7b',
//   moc: '#f1fa8c',
//   proposal: '#f49d9d',
//   ref: '#f472b6',
//   decision: '#ffb86c',
//   lesson: '#fe7d7d',
//   spec: '#bd93f9',
//   dependency: '#8be9fd',
//   reference: '#6272a4',
// };

// function getTypeColor(type: string): string {
//   return TYPE_COLORS[type] || '#d2d3d8';
// }

// function escapeHtml(text: string): string {
//   return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
// }

// function parseTopicsAndBacklinks(html: string): { topics: string[], backlinks: string[] } {
//   const topics: string[] = [];
//   const backlinks: string[] = [];
//   try {
//     const topicsMatch = html.match(/<p>Topics:<\/p>\s*<ul>(.*?)<\/ul>/gs);
//     if (topicsMatch) {
//       const topicItems = topicsMatch[0].match(/<li><a\s[^>]*?href=["'][^>]*?#([^"']+)[^>]*>([^<]*)<\/a><\/li>/g);
//       if (topicItems) {
//         topicItems.forEach(item => {
//           const m = item.match(/href=["']#([^"']+)[^>]*>/);
//           if (m) {
//             const slug = m[1];
//             if (!backlinks.includes(slug) && !topics.includes(slug)) {
//               topics.push(slug);
//             }
//           }
//         });
//       }
//     }
//     const backlinkMatch = html.match(/<p>Relevant Notes:<\/p>\s*<ul>(.*?)<\/ul>/gs);
//     if (backlinkMatch) {
//       const blItems = backlinkMatch[0].match(/<li><a\s[^>]*?href=["'][^>]*?#([^"']+)[^>]*>([^<]*)<\/a><\/li>/g);
//       if (blItems) {
//         blItems.forEach(item => {
//           const m = item.match(/href=["']#([^"']+)[^>]*>/);
//           if (m) {
//             const slug = m[1];
//             if (!backlinks.includes(slug)) {
//               backlinks.push(slug);
//             }
//           }
//         });
//       }
//     }
//   } catch {
//     // Parsing failed
//   }
//   return { topics, backlinks };
// }

// export function BrainGraph() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const networkRef = useRef<any>(null);
//   const [brainData, setBrainData] = useState<BrainData | null>(null);
//   const [isVisNetworkLoaded, setIsVisNetworkLoaded] = useState(false);
//   const [selectedNode, setSelectedNode] = useState<string | null>(null);
//   const [showWiki, setShowWiki] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [activeDomain, setActiveDomain] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [nodeList, setNodeList] = useState<BrainNode[]>([]);
//   const [copied, setCopied] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const nodeContentRef = useRef<Record<string, BrainNodeContent>>({});
//   const [topicData, setTopicData] = useState<Record<string, { topics: string[], backlinks: string[] }>>({});
//   const [categoryOrder] = useState(['moc', 'procedure', 'concept', 'lesson', 'spec', 'decision', 'dependency', 'reference']);

//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   useEffect(() => {
//     if (window.BRAIN_DATA) {
//       setBrainData(window.BRAIN_DATA);
//       nodeContentRef.current = window.BRAIN_DATA.nodeContent || {};
//       const parsed: Record<string, { topics: string[], backlinks: string[] }> = {};
//       Object.entries(window.BRAIN_DATA.nodeContent).forEach(([key, content]) => {
//         parsed[key] = parseTopicsAndBacklinks(content.html);
//       });
//       setTopicData(parsed);
//     }
//   }, []);

//   const showWikiView = useCallback((nodeId: string) => {
//     setSelectedNode(nodeId);
//     setShowWiki(true);
//     if (networkRef.current) { networkRef.current.selectNodes([nodeId]); }
//   }, []);

//   const hideWiki = useCallback(() => {
//     setShowWiki(false);
//     if (networkRef.current) { networkRef.current.unselectAll(); }
//   }, []);

//   const focusInGraph = useCallback(() => {
//     setShowWiki(false);
//     setTimeout(() => {
//       if (selectedNode && networkRef.current) {
//         networkRef.current.focus(selectedNode, { scale: 1.5, animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
//         networkRef.current.selectNodes([selectedNode]);
//       }
//     }, 350);
//   }, [selectedNode]);

//   const handleCopy = async () => {
//     if (selectedNode) {
//       await navigator.clipboard.writeText(selectedNode);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const onSearch = useCallback((value: string) => { setSearchQuery(value); }, []);

//   const filterDomain = useCallback((slug: string | null) => {
//     setActiveDomain(slug);
//     if (selectedNode) setSelectedNode(null);
//   }, [selectedNode]);

//   useEffect(() => {
//     if (!brainData) return;
//     let filtered = brainData.nodes;
//     if (activeDomain && brainData.domainMaps[activeDomain]) {
//       const domainIds = new Set(brainData.domainMaps[activeDomain].nodes);
//       domainIds.add(activeDomain);
//       filtered = filtered.filter(n => domainIds.has(n.id));
//     }
//     if (searchQuery.trim()) {
//       filtered = filtered.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
//     }
//     setNodeList(filtered);
//   }, [brainData, activeDomain, searchQuery]);

//   const buildGraph = useCallback((): void => {
//     if (!isVisNetworkLoaded || !brainData || !containerRef.current) return;
//     const { DataSet, Network } = window.vis;
//     if (!DataSet || !Network) return;

//     let nodesSet = new Set(brainData.nodes.map(n => n.id));
//     if (activeDomain && brainData.domainMaps[activeDomain]) {
//       nodesSet = new Set([...brainData.domainMaps[activeDomain].nodes, activeDomain]);
//     }
//     if (searchQuery.trim()) {
//       nodesSet = new Set(brainData.nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase())).map(n => n.id));
//     }

//     const nodesArray = brainData.nodes.map((node) => ({
//       id: node.id,
//       label: node.label,
//       group: node.group,
//       color: {
//         background: TYPE_COLORS[node.group] || '#6b7280',
//         border: TYPE_COLORS[node.group] || '#6b7280',
//       },
//       shape: 'dot',
//       size: Math.min(15 + (node.edges * 2), 40),
//       font: { color: '#f8f8f2', face: 'Satoshi, sans-serif', size: 12 },
//       borderWidth: 1,
//       hidden: !nodesSet.has(node.id),
//     }));

//     const edgesArray = brainData.edges
//       .filter(e => brainData.nodes.some(n => n.id === e.from) && brainData.nodes.some(n => n.id === e.to))
//       .map(e => ({
//         id: `e-${e.from}-${e.to}`,
//         from: e.from,
//         to: e.to,
//         color: { color: 'rgba(152, 232, 193, 0.15)', hover: 'rgba(152, 232, 193, 0.4)' },
//         width: 1,
//         smooth: { type: 'continuous', roundness: 0.3 },
//         arrows: { to: { enabled: true, scaleFactor: 0.4 } },
//         hidden: !nodesSet.has(e.from) || !nodesSet.has(e.to),
//       }));

//     const options = {
//       physics: {
//         solver: 'forceAtlas2Based',
//         forceAtlas2Based: {
//           gravitationalConstant: -40,
//           centralGravity: 0.008,
//           springLength: 120,
//           springConstant: 0.04,
//           damping: 0.4,
//           avoidOverlap: 0.3,
//         },
//         stabilization: { iterations: 150, fit: true },
//       },
//       interaction: { hover: true, tooltipDelay: 200, navigationButtons: false },
//       nodes: { shape: 'dot' },
//       edges: { font: { size: 0 } },
//       layout: { improvedLayout: true },
//     };

//     const network = new Network(containerRef.current, {
//       nodes: new DataSet(nodesArray),
//       edges: new DataSet(edgesArray),
//     }, options);

//     network._allNodes = nodesArray;
//     network._allEdges = edgesArray;

//     network.on('click', (params: any) => {
//       if (params.nodes.length > 0) showWikiView(params.nodes[0]);
//     });

//     network.on('doubleClick', (params: any) => {
//       if (params.nodes.length > 0) {
//         network.focus(params.nodes[0], { scale: 1.5, animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
//       }
//     });

//     networkRef.current = network;

//   });

//   // - NETWORK LOADING & GRAPH REBUILD -
//   useEffect(() => {
//     if (isVisNetworkLoaded) return;

//     const loadVisNetwork = () => {
//       const script = document.createElement('script');
//       script.src = 'https://unpkg.com/vis-network@9.1.9/standalone/umd/vis-network.min.js';
//       script.async = true;
//       script.onload = () => {
//         setIsVisNetworkLoaded(true);
//       };
//       document.head.appendChild(script);
//     };

//     if (window.BRAIN_DATA && !isVisNetworkLoaded) {
//       setBrainData(window.BRAIN_DATA);
//       nodeContentRef.current = window.BRAIN_DATA.nodeContent || {};
//     }

//     const loadSequence = () => loadVisNetwork();

//     if (!isVisNetworkLoaded) {
//       loadVisNetwork();
//     }

//     return () => {
//       window.removeEventListener('load', loadSequence);
//     };
//   }, [isVisNetworkLoaded]);

//   // Rebuild graph when vis-network loads AND brain data is available
//   useEffect(() => {
//     if (isVisNetworkLoaded && brainData) {
//       buildGraph();
//     }
//   }, [isVisNetworkLoaded, brainData]);

//   // Scroll wiki to top when switching nodes
//   useEffect(() => {
//     if (showWiki) {
//       const wiki = document.getElementById('wiki-view');
//       if (wiki) wiki.scrollTop = 0;
//     }
//   }, [showWiki, selectedNode]);


//   // ── RENDER ───────────────────────────────────────────────────────
//   if (!brainData) {
//     return (
//       <div className="flex items-center justify-center h-full" style={{ color: '#858585', fontFamily: 'Satoshi, sans-serif' }}>
//         <div>Loading brain data...</div>
//       </div>
//     );
//   }

//   const D = brainData;
//   const domains = Object.keys(D.domainMaps || {});
//   const selectedNodeInfo = D?.nodes.find(n => n.id === selectedNode);
//   const contentNode = selectedNode ? nodeContentRef.current[selectedNode || ''] : null;
//   const fm = contentNode?.frontmatter || {};
//   const nodeType = (fm.type || selectedNodeInfo?.type || 'concept').toLowerCase();
//   const status = (fm.status || 'active').toLowerCase();
//   const created = fm.created || '';
//   const topics = (topicData[selectedNode || ''] || {}).topics || [];
//   const backlinks = (topicData[selectedNode || ''] || {}).backlinks || [];
//   const heading = selectedNodeInfo ? selectedNodeInfo.label : (selectedNode || '').replace(/-/g, ' ');
//   const statusClass = status === 'outdated' ? 'outdated' : status === 'speculative' ? 'speculative' : '';

//   // Group nodes by type for sidebar
//   const groupedNodes: Record<string, BrainNode[]> = {};
//   nodeList.forEach(n => {
//     const t = n.type || 'other';
//     if (!groupedNodes[t]) groupedNodes[t] = [];
//     groupedNodes[t].push(n);
//   });

//   // Render node item helper
//   const renderNodeItem = (node: BrainNode) => {
//     return (
//       <div
//         className={`node-item${selectedNode === node.id ? ' active' : ''}`}
//         onClick={() => showWikiView(node.id)}
//         data-id={node.id}
//         key={node.id}
//       >
//         <div className="node-item-title">{node.label}</div>
//         <div className="node-item-desc">{node.description || ''}</div>
//       </div>
//     );
//   };

//   return (
//     <div className="brain-wrap">
//       {/* Sidebar */}
//       <aside className="brain-sidebar" id="sidebar">
//         <div className="sidebar-header">
//           <div className="sidebar-title">
//             <span className="brain-icon">🧠</span> terp-brain
//           </div>
//           <div className="search-box">
//             <span className="search-icon">⌕</span>
//             <input
//               type="text"
//               className="search-input"
//               placeholder="Search nodes..."
//               value={searchQuery}
//               onChange={(e) => onSearch(e.target.value)}
//               autoComplete="off"
//             />
//           </div>
//         </div>

//         <div className="domain-section" id="domain-section">
//           <div className="domain-label">Domain Maps</div>
//           <div className="domain-pills" id="domain-pills">
//             <button
//               className={`domain-pill${activeDomain === null ? ' active' : ''}`}
//               onClick={() => filterDomain(null)}
//               data-domain=""
//             >
//               All
//             </button>
//             {domains.map(slug => (
//               <button
//                 key={slug}
//                 className={`domain-pill${activeDomain === slug ? ' active' : ''}`}
//                 onClick={() => filterDomain(slug)}
//                 data-domain={slug}
//               >
//                 {slug.replace(/-/g, ' ')}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="node-count" id="node-count">{nodeList.length} of {D.nodes.length} nodes</div>

//         <div className="node-list-wrap" id="node-list">
//           {categoryOrder.concat(Object.keys(groupedNodes).filter(g => !categoryOrder.includes(g))).map(type => {
//             if (!groupedNodes[type]) return null;
//             const color = TYPE_COLORS[type] || '#6b7280';
//             return (
//               <div key={type}>
//                 <div className="node-group-title" style={{ borderLeft: '2px solid ' + color, paddingLeft: '0.8rem' }}>
//                   {type} ({groupedNodes[type].length})
//                 </div>
//                 {groupedNodes[type].sort((a: BrainNode, b: BrainNode) => a.label.localeCompare(b.label)).map(renderNodeItem)}
//               </div>
//             );
//           })}
//         </div>

//         <div className="stats-bar" id="stats-bar">{D.nodes.length} nodes · {D.edges.length} edges · {domains.length} domains</div>
//       </aside>

//       {/* Content area */}
//       <div className="brain-content">
//         <div id="graph-container" ref={containerRef} style={{ width: '100%', height: '100%' }} />
//         {!showWiki && (
//           <div className="graph-hint" id="graph-hint">Click a node to view · Scroll to zoom · Drag to pan</div>
//         )}

//         {/* Wiki view */}
//         {showWiki && selectedNode && contentNode && (
//           <div className="wiki-view" id="wiki-view">
//             <div className="wiki-toolbar">
//               <button className="wiki-btn" onClick={hideWiki}>
//                 ← Back to graph
//               </button>
//               <button className="wiki-btn" onClick={focusInGraph}>
//                 View in graph
//               </button>
//             </div>
//             <div id="wiki-content">
//               {/* Pills */}
//               <div className="wiki-pills">
//                 <span className="wiki-pill pill-type">{nodeType}</span>
//                 <span className={`wiki-pill pill-status${statusClass}`}>{status}</span>
//                 {created && <span className="wiki-pill pill-status">{created}</span>}
//               </div>

//               {/* Title */}
//               <h1 className="wiki-title">{selectedNodeInfo ? selectedNodeInfo.label : selectedNode?.replace(/-/g, ' ')}</h1>

//               {/* Description */}
//               {fm.description && <p className="wiki-description">{fm.description}</p>}

//               {/* Body */}
//               <div className="wiki-body" dangerouslySetInnerHTML={{ __html: contentNode.html }} />

//               {/* Topics */}
//               {topics.length > 0 && (
//                 <div className="wiki-section">
//                   <div className="wiki-section-title">Topics</div>
//                   <div className="topic-pills">
//                     {topics.map((t, i) => (
//                       <span className="topic-pill" key={i}>
//                         <a href="#" onClick={(e) => {
//                           e.preventDefault();
//                           showWikiView(t);
//                         }}>{t}</a>
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Backlinks */}
//               {backlinks.length > 0 && (
//                 <div className="wiki-section">
//                   <div className="wiki-section-title">Backlinks ({backlinks.length})</div>
//                   <div className="backlink-list">
//                     {backlinks.map(bl => {
//                       const blNode = D.nodes.find(n => n.id === bl);
//                       const label = blNode ? blNode.label : bl.replace(/-/g, ' ');
//                       return (
//                         <div className="backlink-item" key={bl} onClick={() => showWikiView(bl)}>
//                           {label}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Mobile sidebar toggle */}
//       {isMobile && (
//         <button
//           className="sidebar-toggle"
//           id="sidebar-toggle"
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//         >
//           ☰
//         </button>
//       )}
//     </div>
//   );
// }
