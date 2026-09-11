export const FILM = {
  hero: "/landing/film/01-hero.jpg?v=2",
  pipeline: "/landing/film/02-pipeline.jpg?v=2",
  features: "/landing/film/03-features.jpg?v=2",
  output: "/landing/film/04-output.jpg?v=2",
  exports: "/landing/film/05-exports.jpg?v=2",
  boundaries: "/landing/film/06-boundaries.jpg?v=2",
  start: "/landing/film/07-start.jpg?v=2",
  cta: "/landing/film/08-cta.jpg?v=2",
} as const;

export function Film({
  src,
  priority = false,
  pos = "50% 42%",
}: {
  src: string;
  priority?: boolean;
  pos?: string;
}) {
  return (
    <div className="landing-film" aria-hidden="true">
      <img
        src={src}
        alt=""
        width={1280}
        height={720}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        className="landing-film-img"
        style={{ objectPosition: pos }}
      />
    </div>
  );
}
