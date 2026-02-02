"use client"
import { useState, useEffect, useCallback, useRef } from "react";
import '@xyflow/react/dist/style.css';
import { Background, ReactFlow, BackgroundVariant, Controls, useNodesState, Node, OnNodeDrag, useReactFlow, ReactFlowProvider } from "@xyflow/react";
import BoxNode from "@/components/BoxNode";
import AuthGate from "@/app/(auth)/AuthGate";
import NewBox from "@/components/NewBox";
import { auth } from "@/firebase";

const nodeTypes = {
    box: BoxNode
}

interface BoxData {
    boxId: string;
    boxName: string;
    boxImage: string;
    ownerId: string;
    status: boolean;
    createdAt: number;
}

function DropFlow() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTrashHovered, setIsTrashHovered] = useState(false);
    const trashRef = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    // Delete box function
    const deleteBox = useCallback(async (boxId: string, boxName: string) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${boxName}"?`);
        if (!confirmDelete) return;

        // Immediately hide the node from UI
        setNodes((nds) => nds.filter((n) => n.id !== boxId));

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                console.error("User not authenticated");
                return;
            }

            const response = await fetch(`/api/boxes/${boxId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error("Failed to delete box");
            }
        } catch (error) {
            console.error("Error deleting box:", error);
        }
    }, [setNodes]);

    // Handle node drag over trash
    const onNodeDrag: OnNodeDrag = useCallback((event, node) => {
        if (!trashRef.current) return;
        
        const trashBounds = trashRef.current.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const isOverTrash = 
            mouseX >= trashBounds.left - 30 &&
            mouseX <= trashBounds.right + 30 &&
            mouseY >= trashBounds.top - 30 &&
            mouseY <= trashBounds.bottom + 30;

        setIsTrashHovered(isOverTrash);
        
        // Update the dragged node's data to show visual feedback
        setNodes((nds) =>
            nds.map((n) =>
                n.id === node.id
                    ? { ...n, data: { ...n.data, isOverTrash } }
                    : n
            )
        );
    }, [setNodes]);

    // Handle node drop on trash
    const onNodeDragStop: OnNodeDrag = useCallback((event, node) => {
        if (!trashRef.current) return;
        
        const trashBounds = trashRef.current.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const isOverTrash = 
            mouseX >= trashBounds.left - 30 &&
            mouseX <= trashBounds.right + 30 &&
            mouseY >= trashBounds.top - 30 &&
            mouseY <= trashBounds.bottom + 30;

        setIsTrashHovered(false);
        
        // Reset the node's isOverTrash state
        setNodes((nds) =>
            nds.map((n) =>
                n.id === node.id
                    ? { ...n, data: { ...n.data, isOverTrash: false } }
                    : n
            )
        );

        if (isOverTrash) {
            deleteBox(node.id, node.data.label as string);
        }
    }, [deleteBox, setNodes]);

    // Fetch existing boxes on mount
    useEffect(() => {
        const fetchBoxes = async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                if (!token) return;

                const response = await fetch('/api/boxes', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const boxes: BoxData[] = await response.json();
                    const boxNodes: Node[] = boxes.map((box, index) => ({
                        id: box.boxId,
                        type: "box",
                        position: { x: 150 + (index % 4) * 300, y: 150 + Math.floor(index / 4) * 350 },
                        data: { label: box.boxName, boxId: box.boxId, boxImage: box.boxImage }
                    }));
                    setNodes(boxNodes);
                }
            } catch (error) {
                console.error("Error fetching boxes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Wait for auth state
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchBoxes();
            } else {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [setNodes]);

    const handleBoxCreated = useCallback((boxData: BoxData) => {
        // Convert screen center to flow position (accounts for pan/zoom)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const flowPosition = screenToFlowPosition({ x: centerX, y: centerY });
        
        // Position the new node at the center of the current viewport with a small random offset
        const newNode: Node = {
            id: boxData.boxId,
            type: "box",
            position: { 
                x: flowPosition.x - 100 + (Math.random() * 100 - 50), 
                y: flowPosition.y - 150 + (Math.random() * 100 - 50) 
            },
            data: { label: boxData.boxName, boxId: boxData.boxId, boxImage: boxData.boxImage }
        };
        setNodes((nds) => [...nds, newNode]);
    }, [setNodes, screenToFlowPosition]);

    return (
        <>
            <ReactFlow 
                proOptions={{ hideAttribution: true }} 
                style={{ backgroundColor: "#000000" }}
                nodes={nodes}
                onNodesChange={onNodesChange}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
            >
                {/* <Background variant={BackgroundVariant.Dots} gap={25} size={2} color="#b6b6b6ff" /> */}
                <Controls />
            </ReactFlow>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
                        <p className="text-white font-medium">Getting the boxes...</p>
                    </div>
                </div>
            )}
            <div className="absolute top-5 left-5">
                <h1 className="text-2xl font-semibold text-white">OneDrop</h1>
            </div>
            <div className="absolute bottom-5">
                <NewBox onBoxCreated={handleBoxCreated} />
            </div>
            <div 
                ref={trashRef}
                className="absolute flex flex-col items-center justify-center bottom-3 right-7 w-20 h-20 hover:cursor-pointer transition-transform"
            >
                <img 
                    src="/images/trash.png" 
                    alt="Trash" 
                />
                <p className="text-sm text-white">Trash</p>
            </div>
        </>
    );
}

export default function Drop() {
    return (
        <AuthGate>
            <div className="flex items-center justify-center h-screen">
                <ReactFlowProvider>
                    <DropFlow />
                </ReactFlowProvider>
            </div>
        </AuthGate>
    );
}