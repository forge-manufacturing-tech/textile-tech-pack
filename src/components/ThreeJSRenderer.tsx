import React, { useMemo } from 'react';

interface ThreeJSRendererProps {
    code: string;
}

export function ThreeJSRenderer({ code }: ThreeJSRendererProps) {
    const srcDoc = useMemo(() => {
        // Simple escape for script tags to prevent breaking the HTML structure
        const safeCode = code.replace(/<\/script>/g, '<\\/script>');

        return `
<!DOCTYPE html>
<html>
<head>
    <style>body { margin: 0; overflow: hidden; background: transparent; }</style>
    <!-- Load Three.js from CDN -->
    <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
</head>
<body>
    <div id="container" style="width: 100vw; height: 100vh;"></div>
    <script>
        const container = document.getElementById('container');

        window.onload = function() {
            try {
                if (!window.THREE) throw new Error("Three.js failed to load");

                // Wrap in function to avoid global scope pollution
                (function() {
                    const THREE = window.THREE;
                    // User Code Start
                    ${safeCode}
                    // User Code End
                })();
            } catch (e) {
                document.body.innerHTML = '<div style="color: #ff6b6b; font-family: monospace; padding: 10px; font-size: 12px; background: rgba(0,0,0,0.8);">' + e.toString() + '</div>';
                console.error(e);
            }
        };
    </script>
</body>
</html>
        `;
    }, [code]);

    return (
        <div className="mt-4 border border-industrial-copper-500/30 bg-black/40 rounded-sm overflow-hidden relative group">
            <div className="absolute top-0 left-0 px-2 py-1 bg-industrial-copper-500/20 border-b border-r border-industrial-copper-500/30 text-[9px] font-mono text-industrial-copper-500 uppercase tracking-widest z-10">
                3D Viewport (Sandboxed)
            </div>
            <iframe
                srcDoc={srcDoc}
                className="w-full h-64 md:h-96 border-0"
                sandbox="allow-scripts"
                title="3D Visualization"
            />
            <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <span className="text-[8px] font-mono text-industrial-steel-500">RENDERED WITH THREE.JS</span>
            </div>
        </div>
    );
}
