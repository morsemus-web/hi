"use client";

import { useState } from "react";
import Link from "next/link";

interface ImageSlot {
  file: File | null;
  uploading: boolean;
  url: string | null;
  ref: string;
}

export default function CreateNews() {
  const [passcode, setPasscode] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);

  const [images, setImages] = useState<ImageSlot[]>(
    Array.from({ length: 5 }, (_, i) => ({
      file: null,
      uploading: false,
      url: null,
      ref: `image-${i + 1}`,
    }))
  );

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    category: "cricket" as string,
    author: "ScoreDeck Sports Desk",
    tags: "",
  });

  async function verifyPasscode() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/news/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (data.valid) {
        setAuthenticated(true);
      } else {
        setError("Invalid passcode");
      }
    } catch {
      setError("Verification failed");
    }
    setLoading(false);
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function uploadImage(index: number) {
    const slot = images[index];
    if (!slot.file) return;

    const updated = [...images];
    updated[index] = { ...slot, uploading: true };
    setImages(updated);

    try {
      const formData = new FormData();
      formData.append("passcode", passcode);
      formData.append("file", slot.file);
      formData.append("ref", slot.ref);

      const res = await fetch("/api/news/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        updated[index] = { ...slot, uploading: false, url: data.url };
      } else {
        updated[index] = { ...slot, uploading: false };
        setError(data.error || "Upload failed");
      }
    } catch {
      updated[index] = { ...slot, uploading: false };
      setError("Image upload failed");
    }
    setImages(updated);
  }

  async function publishArticle() {
    setError("");
    setLoading(true);

    const imageMap: Record<string, string> = {};
    for (const slot of images) {
      if (slot.url) {
        imageMap[slot.ref] = slot.url;
      }
    }

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode,
          article: {
            ...form,
            slug: form.slug || generateSlug(form.title),
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
            images: Object.keys(imageMap).length > 0 ? imageMap : undefined,
            publishedAt: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublished(true);
      } else {
        setError(data.error || "Failed to publish");
      }
    } catch {
      setError("Publishing failed");
    }
    setLoading(false);
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="max-w-sm w-full px-6">
          <h1 className="text-xl font-bold tracking-tight mb-6">Publish News</h1>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verifyPasscode()}
            placeholder="Enter passcode"
            className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/40 mb-4"
          />
          {error && <p className="text-sport-f1 text-xs mb-4">{error}</p>}
          <button
            onClick={verifyPasscode}
            disabled={loading || !passcode}
            className="w-full py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-bg bg-accent hover:bg-accent/90 transition-colors cursor-pointer rounded-md disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </div>
      </main>
    );
  }

  if (published) {
    return (
      <main className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-4">Published!</h1>
          <p className="text-text-dim text-sm mb-6">
            Your article has been saved. Redeploy the site to make it live.
          </p>
          <Link
            href={`/news/${form.slug || generateSlug(form.title)}`}
            className="text-accent hover:underline text-sm"
          >
            Preview article &rarr;
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <Link
          href="/news"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; Back to News
        </Link>

        <h1 className="text-2xl font-bold mt-8 mb-8 tracking-tight">
          Publish Article
        </h1>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Title
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                  slug: generateSlug(e.target.value),
                })
              }
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-accent/40"
              placeholder="Article title"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Slug
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-sm text-text-primary font-mono focus:outline-none focus:border-accent/40"
              placeholder="auto-generated-from-title"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Description (SEO)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-accent/40 resize-none"
              placeholder="Short description for search engines"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-accent/40"
            >
              <option value="cricket">Cricket</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="f1">F1</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Author
            </label>
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-accent/40"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Tags (comma separated)
            </label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-sm text-text-primary focus:outline-none focus:border-accent/40"
              placeholder="cricket, IPL, preview"
            />
          </div>

          {/* Image Uploads */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Images (up to 5)
            </label>
            <p className="text-[10px] text-text-muted/50 mb-3">
              Upload images, then use <code className="text-accent/70">(image-1)</code>, <code className="text-accent/70">(image-2)</code>, etc. in content to place them.
            </p>
            <div className="space-y-3">
              {images.map((slot, idx) => (
                <div key={slot.ref} className="flex items-center gap-3">
                  <span className="text-[10px] text-text-muted/60 font-mono w-16 shrink-0">
                    {slot.ref}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      const updated = [...images];
                      updated[idx] = { ...slot, file, url: null };
                      setImages(updated);
                    }}
                    className="flex-1 text-xs text-text-dim file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-medium file:bg-overlay-5 file:text-text-primary file:cursor-pointer"
                  />
                  <button
                    onClick={() => uploadImage(idx)}
                    disabled={!slot.file || slot.uploading || !!slot.url}
                    className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-md bg-accent/15 text-accent hover:bg-accent/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {slot.uploading ? "..." : slot.url ? "Done" : "Upload"}
                  </button>
                  {slot.url && (
                    <span className="text-sport-cricket text-[10px]">Uploaded</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-2">
              Content (Markdown)
            </label>
            <p className="text-[10px] text-text-muted/50 mb-2">
              Use ## for headings, - for bullet points, (image-N) for images. Regular text becomes paragraphs.
            </p>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={20}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-sm text-text-primary font-mono focus:outline-none focus:border-accent/40 resize-y"
              placeholder="Write your article content here..."
            />
          </div>

          {error && <p className="text-sport-f1 text-xs">{error}</p>}

          <button
            onClick={publishArticle}
            disabled={loading || !form.title || !form.content || !form.description}
            className="w-full py-3.5 text-[11px] font-medium uppercase tracking-[0.12em] text-bg bg-accent hover:bg-accent/90 transition-colors cursor-pointer rounded-md disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </div>
    </main>
  );
}
