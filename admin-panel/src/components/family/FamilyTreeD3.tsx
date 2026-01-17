import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';

interface Member {
    id: number;
    name?: string;
    email: string;
    role: string;
    familyRole?: string;
    headOfFamily?: boolean;
    profileImage?: string;
}

interface House {
    id: number;
    name: string;
    members: Member[];
}

interface Family {
    id: number;
    name: string;
    members?: Member[];
    houses?: House[];
}

interface FamilyTreeD3Props {
    family: Family;
    unassignedMembers?: Member[];
}

// Extend HierarchyNode to support collapsing
interface MetricNode extends d3.HierarchyNode<TreeNode> {
    x0?: number;
    y0?: number;
    _children?: MetricNode[] | null; // For holding collapsed children
}

interface TreeNode {
    name: string;
    type: 'root' | 'house' | 'member';
    id?: number;
    data?: any;
    image?: string;
    role?: string;
    headOfHouse?: boolean;
    children?: TreeNode[];
}

export default function FamilyTreeD3({ family, unassignedMembers = [] }: FamilyTreeD3Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const rootRef = useRef<MetricNode | null>(null);

    useEffect(() => {
        if (!family || !svgRef.current || !containerRef.current) return;

        // --- 1. PREPARE DATA ---
        const rootData: TreeNode = {
            name: family.name,
            type: 'root',
            id: family.id,
            children: []
        };

        // Add Houses
        if (family.houses) {
            family.houses.forEach(house => {
                const head = house.members.find(m => m.familyRole === 'HEAD' || m.headOfFamily);
                const otherMembers = house.members.filter(m => m.id !== head?.id);

                const houseNode: TreeNode = {
                    name: house.name,
                    type: 'house',
                    id: house.id,
                    data: house,
                    children: []
                };

                if (head) {
                    houseNode.image = head.profileImage;
                    houseNode.role = 'Head of House';
                    houseNode.headOfHouse = true;
                    houseNode.data = { ...house, headName: head.name || head.email, headId: head.id };
                }

                otherMembers.forEach(member => {
                    houseNode.children?.push({
                        name: member.name || member.email,
                        type: 'member',
                        id: member.id,
                        data: member,
                        image: member.profileImage,
                        role: member.familyRole
                    });
                });
                rootData.children?.push(houseNode);
            });
        }

        // Add Unassigned
        if (unassignedMembers.length > 0) {
            const unassignedNode: TreeNode = {
                name: "Direct Members",
                type: 'house',
                children: []
            };
            unassignedMembers.forEach(member => {
                unassignedNode.children?.push({
                    name: member.name || member.email,
                    type: 'member',
                    id: member.id,
                    data: member,
                    image: member.profileImage,
                    role: member.familyRole
                });
            });
            rootData.children?.push(unassignedNode);
        }

        // --- 2. SETUP D3 ---
        const width = containerRef.current.clientWidth;
        const height = 600;
        const margin = { top: 60, right: 90, bottom: 30, left: 90 };
        const duration = 500;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height]);

        svg.selectAll('*').remove(); // Clear all

        // Group for Zooming
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Setup Zoom
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Initial centering transform for zoom
        svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, margin.top));


        // Create Hierarchy
        const root = d3.hierarchy<TreeNode>(rootData) as MetricNode;
        root.x0 = 0;
        root.y0 = 0;


        // Use ref/state to keep tree consistent if we rerender? 
        // For now simple re-render is fine.
        rootRef.current = root;

        const tree = d3.tree<TreeNode>().nodeSize([70, 150]);

        update(root);

        function update(source: MetricNode) {
            const nodes = root.descendants();
            const links = root.links();

            tree(root as any);

            // --- NODES ---
            const node = g.selectAll<SVGGElement, MetricNode>('g.node')
                .data(nodes, (d: any) => d.id || d.data.name + Math.random());

            // ENTER
            const nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr('transform', (d) => `translate(${source.x0 || 0},${source.y0 || 0})`)
                .attr('cursor', 'pointer');

            // Circle / Main Shape
            nodeEnter.append('circle')
                .attr('class', 'node-circle')
                .attr('r', 1e-6)
                .style('fill', (d: any) => {
                    return d._children ? '#bfdbfe' : (d.data.type === 'root' ? '#1e40af' : '#fff');
                })
                .style('stroke', '#2563eb')
                .style('stroke-width', '2px')
                .on('click', (event, d) => click(event, d));

            // Image clipping (defs) OR Initial
            nodeEnter.each(function (d: any) {
                const el = d3.select(this);
                if (d.data.image) {
                    const uid = `clip-${Math.random().toString(36).substr(2, 9)}`;
                    d.clipId = uid;
                    el.append('defs').append('clipPath')
                        .attr('id', uid)
                        .append('circle')
                        .attr('r', 30);

                    el.append('image')
                        .attr('xlink:href', d.data.image)
                        .attr('x', -30).attr('y', -30)
                        .attr('width', 60).attr('height', 60)
                        .attr('clip-path', `url(#${uid})`)
                        .attr('preserveAspectRatio', 'xMidYMid slice')
                        .attr('opacity', 0)
                        .transition().duration(duration).attr('opacity', 1);
                } else {
                    // Fallback to Initial Letter
                    el.append('text')
                        .attr('dy', '.35em')
                        .attr('text-anchor', 'middle')
                        .text((d.data.name || '?').charAt(0).toUpperCase())
                        .attr('fill', d.data.type === 'root' ? 'white' : '#6b7280') // White for root, grey for others
                        .attr('font-size', '24px')
                        .attr('font-weight', 'bold')
                        .attr('pointer-events', 'none')
                        .attr('opacity', 0)
                        .transition().duration(duration).attr('opacity', 1);
                }
            });

            // Labels
            nodeEnter.append('text')
                .attr('dy', 45)
                .attr('text-anchor', 'middle')
                .text((d: any) => d.data.name?.length > 15 ? d.data.name.substring(0, 15) + '...' : d.data.name)
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .style('fill-opacity', 1e-6);

            // HOVER ACTION GROUP
            const actionGroup = nodeEnter.append('g')
                .attr('class', 'action-group')
                .attr('opacity', 0)
                .attr('transform', 'translate(35, -20)');

            // View Button
            actionGroup.append('circle')
                .attr('r', 12)
                .attr('fill', '#fff')
                .attr('stroke', '#fbbf24')
                .attr('cy', 0)
                .attr('cursor', 'pointer')
                .on('click', (e, d: any) => {
                    e.stopPropagation();
                    const targetId = d.data.type === 'house' && d.data.headOfHouse ? d.data.data.headId : d.data.id;
                    if (targetId) navigate(`/members/${targetId}`);
                });
            actionGroup.append('text')
                .attr('dy', 4)
                .attr('text-anchor', 'middle')
                .attr('pointer-events', 'none')
                .attr('font-size', '10px')
                .text('👁️');

            // Edit Button
            actionGroup.append('circle')
                .attr('r', 12)
                .attr('fill', '#fff')
                .attr('stroke', '#3b82f6')
                .attr('cy', 30)
                .attr('cursor', 'pointer')
                .on('click', (e, d: any) => {
                    e.stopPropagation();
                    const targetId = d.data.type === 'house' && d.data.headOfHouse ? d.data.data.headId : d.data.id;
                    if (targetId) navigate(`/members/${targetId}/edit`);
                });
            actionGroup.append('text')
                .attr('dy', 34)
                .attr('text-anchor', 'middle')
                .attr('pointer-events', 'none')
                .attr('font-size', '10px')
                .text('✏️');

            // Hover Events
            nodeEnter
                .on('mouseenter', function () {
                    d3.select(this).select('.action-group')
                        .transition().duration(200)
                        .attr('opacity', 1);
                })
                .on('mouseleave', function () {
                    d3.select(this).select('.action-group')
                        .transition().duration(200)
                        .attr('opacity', 0);
                });


            // UPDATE
            const nodeUpdate = nodeEnter.merge(node);

            nodeUpdate.transition()
                .duration(duration)
                .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

            // Ensure visualization fits
            const nodesHeight = nodes.length * 50; // VERY rough estimate
            // Better: update SVG Height based on max depth
            let maxY = 0;
            root.each((d: any) => { if (d.y > maxY) maxY = d.y; });
            const newHeight = maxY + margin.top + margin.bottom + 100;
            svg.transition().duration(duration).attr('height', Math.max(600, newHeight));

            nodeUpdate.select('circle.node-circle')
                .attr('r', 30)
                .style('fill', (d: any) => d._children ? '#eff6ff' : (d.data.type === 'root' ? '#1e40af' : '#fff'));

            nodeUpdate.select('text')
                .style('fill-opacity', 1);

            // EXIT
            const nodeExit = node.exit().transition()
                .duration(duration)
                .attr('transform', (d) => `translate(${source.x},${source.y})`)
                .remove();

            nodeExit.select('circle')
                .attr('r', 1e-6);

            nodeExit.select('text')
                .style('fill-opacity', 1e-6);

            // --- LINKS ---
            const link = g.selectAll('path.link')
                .data(links, (d: any) => d.target.id);

            const linkEnter = link.enter().insert('path', 'g')
                .attr('class', 'link')
                .attr('d', (d) => {
                    const o = { x: source.x0 || 0, y: source.y0 || 0 };
                    return d3.linkVertical()({ source: o, target: o } as any);
                })
                .attr('fill', 'none')
                .attr('stroke', '#cbd5e1')
                .attr('stroke-width', 2);

            const linkUpdate = linkEnter.merge(link as any);

            linkUpdate.transition()
                .duration(duration)
                .attr('d', d3.linkVertical()
                    .x((d: any) => d.x)
                    .y((d: any) => d.y) as any
                );

            link.exit().transition()
                .duration(duration)
                .attr('d', (d) => {
                    const o = { x: source.x, y: source.y };
                    return d3.linkVertical()({ source: o, target: o } as any);
                })
                .remove();

            nodes.forEach((d: any) => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        function click(event: any, d: MetricNode) {
            if (d.children) {
                d._children = d.children as MetricNode[];
                d.children = null as any;
            } else {
                d.children = d._children as TreeNode[];
                d._children = null;
            }
            update(d);
        }

    }, [family, unassignedMembers]);

    return (
        <div ref={containerRef} className="w-full overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 p-4 min-h-[600px]">
            <svg ref={svgRef} className="mx-auto block" />
            <div className="text-xs text-center text-gray-400 mt-2">
                Scroll to Zoom • Click nodes to expand/collapse • Hover for actions
            </div>
        </div>
    );
}
