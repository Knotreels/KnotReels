'use client';

import HTMLFlipBook from 'react-pageflip';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export interface ComicPanel {
  url: string;
  rotation?: number;
}

export interface ComicPage {
  layout:
    | 'full-page-splash'
    | 'two-up-single'
    | 'tall-two-stack'
    | 'spider-page'
    | 'moose-page';
  panels: ComicPanel[];
}

interface Props {
  pages: ComicPage[];
  coverImage: string;
  onClose: () => void;
}

export default function FlipComicReader({
  pages,
  coverImage,
  onClose,
}: Props) {
  const bookRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  if (!Array.isArray(pages) || pages.length === 0 || !coverImage) {
    return null;
  }

  useEffect(() => {
    function updateSize() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const bookWidth = Math.min(viewport.width * 0.9, 1000);
  const bookHeight = Math.min(viewport.height * 0.97, 1100);

  const renderPanel = (panel: ComicPanel, alt: string) => {
    if (!panel?.url) return null;
    const isVideo =
      panel.url.endsWith('.mp4') || panel.url.includes('video');
    const style = { transform: `rotate(${panel.rotation || 0}deg)` };

    return isVideo ? (
      <div className="relative w-full h-full overflow-hidden">
        <video
          src={panel.url}
          className="w-full h-full object-contain rounded"
          style={style}
          muted
          playsInline
          controls={false}
          preload="metadata"
        />
        <button
          onClick={(e) => {
            const vid =
              (e.currentTarget.previousElementSibling as HTMLVideoElement);
            vid?.paused ? vid.play() : vid.pause();
          }}
          className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded"
        >
          Play
        </button>
      </div>
    ) : (
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={panel.url}
          alt={alt}
          fill
          className="object-contain rounded"
          style={style}
        />
      </div>
    );
  };

  const validPages = pages.filter(
    (p) => Array.isArray(p.panels) && p.panels.length && p.panels[0]?.url
  );
  if (validPages.length === 0 || !viewport.width) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        ✕ Close
      </button>

      <div className="absolute top-6 left-6 flex gap-2">
        <button
          onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
          className="bg-white text-black px-3 py-1 rounded"
        >
          − Zoom
        </button>
        <button
          onClick={() => setScale((s) => Math.min(2, s + 0.1))}
          className="bg-white text-black px-3 py-1 rounded"
        >
          + Zoom
        </button>
      </div>

      <div
        className="transform transition-transform"
        style={{ transform: `scale(${scale})` }}
      >
        <HTMLFlipBook
          style={{}}
          width={bookWidth}
          height={bookHeight}
          showCover
          size="fixed"
          drawShadow
          startZIndex={0}
          disableFlipByClick={false}
          flippingTime={600}
          ref={bookRef}
          className="rounded-lg overflow-hidden shadow-2xl"
          startPage={0}
          autoSize
          showPageCorners
          usePortrait
          minWidth={0}
          maxWidth={1000}
          minHeight={0}
          maxHeight={1100}
          maxShadowOpacity={0.5}
          mobileScrollSupport
          clickEventForward
          useMouseEvents
          swipeDistance={0}
        >
          {/* COVER */}
          <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
            <Image
              src={coverImage}
              alt="Cover"
              fill
              className="object-contain"
            />
          </div>

          {/* PAGES */}
          {validPages.map((page, idx) => (
            // ◀️ add overflow-hidden here
            <div
              key={idx}
              className="w-full h-full p-4 overflow-hidden"
            >
              <div
                className="w-full h-full bg-[#fdfaf4] bg-[url('/paper-texture.png')] bg-cover border-4 border-white rounded-lg p-4 flex flex-col overflow-hidden"
                style={{ height: bookHeight - 32 }}
              >
                {page.layout === 'full-page-splash' &&
                  renderPanel(page.panels[0], `Page ${idx + 1} Full`)}

                {page.layout === 'two-up-single' && (
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex-1 flex gap-4">
                      {[0, 1].map((i) => (
                        <div
                          key={i}
                          className="flex-1 relative overflow-hidden"
                        >
                          {renderPanel(
                            page.panels[i],
                            `Page ${idx + 1} Panel ${i + 1}`
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                      {renderPanel(
                        page.panels[2],
                        `Page ${idx + 1} Panel 3`
                      )}
                    </div>
                  </div>
                )}

                {page.layout === 'tall-two-stack' && (
                  <div className="flex-1 flex gap-4">
                    <div className="flex-[2] relative overflow-hidden">
                      {renderPanel(
                        page.panels[0],
                        `Page ${idx + 1} Tall`
                      )}
                    </div>
                    <div className="flex-[1] flex flex-col gap-4">
                      <div className="flex-1 relative overflow-hidden">
                        {renderPanel(
                          page.panels[1],
                          `Page ${idx + 1} Top Right`
                        )}
                      </div>
                      <div className="flex-1 relative overflow-hidden">
                        {renderPanel(
                          page.panels[2],
                          `Page ${idx + 1} Bottom Right`
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {page.layout === 'spider-page' && (
                  <div className="flex-1 flex gap-4">
                    {page.panels.slice(0, 2).map((p, i) => (
                      <div
                        key={i}
                        className="flex-1 relative overflow-hidden"
                      >
                        {renderPanel(p, `Spider ${i + 1}`)}
                      </div>
                    ))}
                  </div>
                )}

                {page.layout === 'moose-page' && (
                  <div className="flex-1 flex gap-4">
                    {page.panels.slice(0, 2).map((p, i) => (
                      <div
                        key={i}
                        className="flex-1 relative overflow-hidden"
                      >
                        {renderPanel(p, `Moose ${i + 1}`)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
}
