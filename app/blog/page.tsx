import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { wordpress } from "@/lib/wordpress/client";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

const POSTS_PER_PAGE = 9;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const { posts, totalPages, total } = await wordpress.getPostsPaginated({
    limit: POSTS_PER_PAGE,
    page: currentPage,
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-10">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Blog
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">
            Najnowsze wpisy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Porady, nowości ze świata technologii i inspiracje. Bądź na bieżąco z najnowszymi trendami.
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <article className="bg-accent rounded-xl border overflow-hidden hover:border-foreground/20 transition-colors h-full flex flex-col">
                    <div className="aspect-video bg-muted overflow-hidden">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.imageAlt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          Brak zdjęcia
                        </div>
                      )}
                    </div>
                    <div className="relative flex flex-col flex-1">
                      <div className="p-5 pb-0">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                          <Calendar className="h-3 w-3" />
                          <span>{post.date}</span>
                        </div>
                        <h2 className="font-semibold text-xl group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground min-h-[60px]">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-accent via-accent/90 to-transparent backdrop-blur-[2px] rounded-b-xl flex items-end justify-center pb-4" style={{ maskImage: 'linear-gradient(to top, black 60%, transparent)', WebkitMaskImage: 'linear-gradient(to top, black 60%, transparent)' }}>
                        <span className="text-sm font-medium text-primary group-hover:underline">
                          Czytaj więcej
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {currentPage > 1 ? (
                  <Link href={`/blog?page=${currentPage - 1}`}>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="icon" className="h-10 w-10" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current and neighbors
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1;

                    const showEllipsisBefore =
                      page === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter =
                      page === currentPage + 2 && currentPage < totalPages - 2;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span key={page} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <Link key={page} href={`/blog?page=${page}`}>
                        <Button
                          variant={page === currentPage ? "default" : "outline"}
                          size="icon"
                          className="h-10 w-10"
                        >
                          {page}
                        </Button>
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages ? (
                  <Link href={`/blog?page=${currentPage + 1}`}>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="icon" className="h-10 w-10" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border">
            <p className="text-muted-foreground">Brak wpisów do wyświetlenia</p>
          </div>
        )}
      </div>
    </div>
  );
}
