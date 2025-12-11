import { PersonalizationFlow } from '@/components/PersonalizationFlow';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <PersonalizationFlow />
      </div>
    </main>
  );
}
