import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SafeHtml } from "@/components/ui/safe-html";
import { wordpress } from "@/lib/wordpress/client";
import { notFound } from "next/navigation";
import { BlogProductWidgets } from "@/components/blog/blog-product-widgets";

export const revalidate = 60;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [post, relatedPosts] = await Promise.all([
    wordpress.getPost(slug),
    wordpress.getRelatedPosts(slug, null, 2),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="container px-2 sm:px-4 lg:px-8">
        <article className="bg-accent rounded-xl md:rounded-2xl border shadow-lg max-w-6xl mx-auto overflow-hidden">
          {/* Featured Image */}
          {post.image && (
            <div className="aspect-video overflow-hidden">
              <img
                src={post.image}
                alt={post.imageAlt || post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4 md:p-10">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Wróć do bloga
            </Link>

            {/* Category */}
            {post.category && post.category !== "Bez kategorii" && (
              <div className="mb-4">
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime} czytania</span>
              </div>
            </div>

            <Separator className="mb-8" />

            {/* Content */}
            <SafeHtml html={post.content} className="wp-content" />
            <BlogProductWidgets />

            <Separator className="my-10" />

            {/* Share */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Udostępnij:</span>
              <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://homescreen.pl/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://homescreen.pl/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-6xl mx-auto py-12 md:py-16">
            <h2 className="text-2xl font-bold mb-6">Może Cię zainteresować</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <article className="bg-accent rounded-xl border overflow-hidden hover:border-foreground/20 transition-colors">
                    <div className="aspect-video bg-muted overflow-hidden">
                      {relatedPost.image ? (
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.imageAlt || relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          Brak zdjęcia
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>{relatedPost.date}</span>
                      </div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
