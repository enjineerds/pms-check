import { useEffect, useState } from 'react';
import { Platform, ScrollView, Text } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

type Engine = 'mlkit' | 'vision' | 'vision-corrected';

interface Out {
  engine: Engine;
  ms: number;
  error: string | null;
  lines: { text: string; confidence: number | null; box: unknown }[];
}

async function run(engine: Engine, uri: string): Promise<Out> {
  const start = Date.now();
  try {
    if (engine === 'mlkit') {
      const { default: TextRecognition } = await import('@react-native-ml-kit/text-recognition');
      const r = await TextRecognition.recognize(uri);
      const lines = r.blocks.flatMap((b) => b.lines.map((l) => ({ text: l.text, confidence: null, box: l.frame ?? null })));
      return { engine, ms: Date.now() - start, error: null, lines };
    }
    const { recognize } = await import('../../modules/vision-ocr');
    const r = await recognize(uri, engine === 'vision-corrected');
    return { engine, ms: Date.now() - start, error: null, lines: r.lines };
  } catch (e) {
    return { engine, ms: Date.now() - start, error: String(e), lines: [] };
  }
}

// ML Kit has no arm64 iOS-simulator build and the Vision module is Apple-only.
const ENGINES: Engine[] = Platform.OS === 'ios' ? ['vision', 'vision-corrected'] : ['mlkit'];

export default function Spike() {
  const [log, setLog] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const input = new Directory(Paths.document, 'ocr-in');
      const output = new Directory(Paths.document, 'ocr-out');
      if (!output.exists) output.create();
      const files = input.list().filter((f): f is File => f instanceof File);
      for (const [i, f] of files.entries()) {
        for (const engine of ENGINES) {
          const out = await run(engine, f.uri);
          new File(output, `${engine}--${f.name}.json`).write(JSON.stringify(out));
          setLog((l) => [`${i + 1}/${files.length} ${engine} ${out.ms}ms ${out.error ?? out.lines.length} ${f.name}`, ...l]);
        }
      }
      setLog((l) => ['SPIKE DONE', ...l]);
    })().catch((e) => setLog((l) => [`SPIKE FAILED ${String(e)}`, ...l]));
  }, []);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
      {log.map((line, i) => (
        <Text key={i} style={{ fontSize: 11, fontFamily: 'Menlo' }}>
          {line}
        </Text>
      ))}
    </ScrollView>
  );
}
