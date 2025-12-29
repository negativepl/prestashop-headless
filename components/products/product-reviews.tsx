"use client";

import { useState } from "react";
import { Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ProductReviewsProps {
  productId: number;
}

// Placeholder reviews for demonstration
const placeholderReviews = [
  {
    id: 1,
    author: "Anna K.",
    rating: 5,
    date: "2024-01-15",
    content: "Świetny produkt, polecam! Szybka dostawa i zgodny z opisem.",
  },
  {
    id: 2,
    author: "Marek W.",
    rating: 4,
    date: "2024-01-10",
    content: "Dobra jakość w tej cenie. Jedyny minus to opakowanie mogłoby być lepsze.",
  },
  {
    id: 3,
    author: "Katarzyna M.",
    rating: 5,
    date: "2024-01-05",
    content: "Już trzeci raz zamawiam i jestem bardzo zadowolona. Polecam tego sprzedawcę.",
  },
];

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
        >
          <Star
            className={`size-5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ author: "", rating: 5, content: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement review submission
    console.log("Submit review:", { productId, ...newReview });
    alert("Dziękujemy za opinię! Zostanie opublikowana po weryfikacji.");
    setShowForm(false);
    setNewReview({ author: "", rating: 5, content: "" });
  };

  const averageRating = placeholderReviews.reduce((acc, r) => acc + r.rating, 0) / placeholderReviews.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Opinie klientów</h3>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} ({placeholderReviews.length} opinii)
            </span>
          </div>
        </div>
        {!showForm && (
          <Button variant="outline" onClick={() => setShowForm(true)}>
            Dodaj opinię
          </Button>
        )}
      </div>

      {/* Add review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <p className="font-medium">Dodaj swoją opinię</p>
          <div className="space-y-2">
            <label className="text-sm">Twoja ocena</label>
            <StarRating
              rating={newReview.rating}
              onRate={(r) => setNewReview({ ...newReview, rating: r })}
              interactive
            />
          </div>
          <Input
            placeholder="Twoje imię"
            value={newReview.author}
            onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
            required
          />
          <Textarea
            placeholder="Napisz swoją opinię..."
            value={newReview.content}
            onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
            rows={4}
            required
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Anuluj
            </Button>
            <Button type="submit">Wyślij opinię</Button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {placeholderReviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{review.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.date).toLocaleDateString("pl-PL")}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-sm">{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
