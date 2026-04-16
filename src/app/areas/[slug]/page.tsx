import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAreas, getAreaBySlug, getRoutesByAreaId } from "@/lib/walks/data";
import RouteCard from "@/components/walks/RouteCard";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";
import Link from "next/link";

// ISR: 30分ごとに再検証（ルート追加時のキャッシュ更新を早める）
export const revalidate = 1800;

export async function generateStaticParams() {
  try {
    const areas = await getAreas();
    return areas.filter((a) => a.slug && typeof a.slug === "string").map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = await getAreaBySlug(slug);
  if (!area) return {};

  return {
    title: `${area.name}で犬と歩けるおすすめ散歩コース | DogHub`,
    description: `${area.name}（${area.prefecture}）の犬連れ散歩コースを紹介。${area.description ?? ""}`,
    openGraph: {
      title: `${area.name}で犬と歩けるおすすめ散歩コース | DogHub`,
      description: `${area.name}（${area.prefecture}）の犬連れ散歩コースを紹介。`,
    },
  };
}

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = await getAreaBySlug(slug);
  if (!area) notFound();

  const routes = await getRoutesByAreaId(area.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-amber-600">トップ</Link>
        <span className="mx-2">/</span>
        <Link href="/" className="hover:text-amber-600">散歩コース</Link>
        <span className="mx-2">/</span>
        <Link href="/areas" className="hover:text-amber-600">エリア一覧</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{area.name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        {area.name}で犬と歩けるおすすめ散歩コース
      </h1>
      <p className="text-gray-500 mb-2">{area.prefecture}</p>
      {area.description && (
        <p className="text-gray-600 mb-8 leading-relaxed max-w-3xl">{area.description}</p>
      )}

      {routes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p>このエリアにはまだ公開ルートがありません。</p>
          <p className="text-sm mt-2">近日公開予定です！</p>
        </div>
      )}

      <WalksAppCTA />
      <SupportedBadge />
    </div>
  );
}
