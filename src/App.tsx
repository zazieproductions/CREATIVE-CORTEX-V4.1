import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { OsBar } from './components/shell/OsBar';
import { Sidebar } from './components/shell/Sidebar';
import { Workspace } from './components/shell/Workspace';
import { CommandPalette } from './components/shell/CommandPalette';
import { Modal } from './components/shell/Modal';
import { NeuralGraph } from './components/panels/NeuralGraph';
import { VisionStream } from './components/panels/VisionStream';
import { Analytics } from './components/panels/Analytics';
import { NotesVault } from './components/panels/NotesVault';
import { NoteDetail } from './components/panels/NoteDetail';
import { IdeaSynthesis } from './components/panels/IdeaSynthesis';
import { HexLab } from './components/panels/HexLab';
import { CodePrototypes, CodeView } from './components/panels/CodePrototypes';
import { Schemes } from './components/panels/Schemes';
import { generateNotes } from './lib/notes';
import { buildActivitySeries } from './lib/analytics';
import { SCHEMES } from './lib/schemes';
import { DEFAULT_PANELS, PANEL_META } from './lib/layout';
import { CONCEPTS, EDGES } from './lib/concepts';
import type { Note, CodeProto, PanelState } from './types';

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => generateNotes());
  const [panels, setPanels] = useState<PanelState[]>(() => DEFAULT_PANELS.map((p) => ({ ...p })));
  const [raisedId, setRaisedId] = useState<string | null>('neural');
  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedProto, setSelectedProto] = useState<CodeProto | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [visionIndex, setVisionIndex] = useState(67);

  const activity = useMemo(() => buildActivitySeries().map((d) => d.v), []);
  const ideaVelocity = 30 + (visionIndex % 35);
  const vpRef = useRef({ w: 1200, h: 700 });

  // global Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const bumpVision = useCallback(() => setVisionIndex((v) => 30 + ((v - 30 + 7) % 70)), []);
  const onViewport = useCallback((vp: { w: number; h: number }) => { vpRef.current = vp; }, []);
  const onFocused = useCallback(() => setFocusTarget(null), []);

  const movePanel = (id: string, x: number, y: number) => setPanels((ps) => ps.map((p) => (p.id === id ? { ...p, x, y } : p)));
  const resizePanel = (id: string, w: number, h: number) => setPanels((ps) => ps.map((p) => (p.id === id ? { ...p, w, h } : p)));
  const hidePanel = (id: string) => setPanels((ps) => ps.map((p) => (p.id === id ? { ...p, visible: false } : p)));
  const raisePanel = (id: string) => setRaisedId(id);

  const focusPanel = (id: string) => {
    setPanels((ps) => ps.map((p) => (p.id === id ? { ...p, visible: true } : p)));
    setRaisedId(id);
    setFocusTarget(id);
  };
  const togglePanel = (id: string) => setPanels((ps) => ps.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
  const resetLayout = () => {
    setPanels(DEFAULT_PANELS.map((p) => ({ ...p })));
    setRaisedId('neural');
  };

  const openNote = (id: string) => {
    const n = notes.find((x) => x.id === id);
    if (n) {
      setExpanded(null);
      setSelectedNote(n);
    }
  };
  const openProto = (p: CodeProto) => setSelectedProto(p);
  const commitNote = (note: Note) => setNotes((prev) => [note, ...prev]);

  const renderContent = (id: string) => {
    switch (id) {
      case 'neural': return <NeuralGraph notes={notes} onOpenNote={openNote} />;
      case 'vision': return <VisionStream onNew={bumpVision} />;
      case 'analytics': return <Analytics notes={notes} visionIndex={visionIndex} ideaVelocity={ideaVelocity} />;
      case 'notes': return <NotesVault notes={notes} onOpenNote={openNote} />;
      case 'idea': return <IdeaSynthesis onCommit={commitNote} />;
      case 'hex': return <HexLab />;
      case 'code': return <CodePrototypes onOpen={openProto} />;
      case 'schemes': return <Schemes />;
      default: return null;
    }
  };

  const expandMeta = expanded ? PANEL_META.find((m) => m.id === expanded) : null;

  return (
    <div className="h-full flex flex-col bg-cortex text-ink">
      <OsBar
        activity={activity}
        visionIndex={visionIndex}
        ideaVelocity={ideaVelocity}
        noteCount={notes.length}
        onOpenPalette={() => setPaletteOpen(true)}
      />
      <div className="flex-1 flex min-h-0">
        <Sidebar
          panels={panels}
          focusedId={focusTarget ?? raisedId}
          stats={{ notes: notes.length, concepts: CONCEPTS.length, edges: EDGES.length, schemes: SCHEMES.length }}
          onFocus={focusPanel}
          onToggle={togglePanel}
          onReset={resetLayout}
        />
        <Workspace
          panels={panels}
          raisedId={raisedId}
          focusTarget={focusTarget}
          onMove={movePanel}
          onResize={resizePanel}
          onHide={hidePanel}
          onExpand={setExpanded}
          onRaise={raisePanel}
          onFocused={onFocused}
          onViewport={onViewport}
          renderContent={renderContent}
        />
      </div>

      <CommandPalette
        open={paletteOpen}
        notes={notes}
        onClose={() => setPaletteOpen(false)}
        onOpenNote={openNote}
        onFocusPanel={focusPanel}
      />

      {/* expand modal */}
      <Modal
        open={!!expanded}
        title={expandMeta?.title ?? ''}
        subtitle={expandMeta?.subtitle}
        accent={expandMeta?.accent ?? '#22d3ee'}
        onClose={() => setExpanded(null)}
      >
        {expanded && <div className="h-[78vh]">{renderContent(expanded)}</div>}
      </Modal>

      {/* note modal */}
      <Modal
        open={!!selectedNote}
        title="Field Note"
        subtitle={selectedNote ? `${selectedNote.id} · ${selectedNote.domain}` : ''}
        accent="#34d399"
        onClose={() => setSelectedNote(null)}
      >
        {selectedNote && <NoteDetail note={selectedNote} notes={notes} onOpenNote={openNote} />}
      </Modal>

      {/* code modal */}
      <Modal
        open={!!selectedProto}
        title={selectedProto?.title ?? ''}
        subtitle={selectedProto ? `${selectedProto.language} · ${selectedProto.domain}` : ''}
        accent="#2dd4bf"
        onClose={() => setSelectedProto(null)}
      >
        {selectedProto && <CodeView proto={selectedProto} />}
      </Modal>
    </div>
  );
}
