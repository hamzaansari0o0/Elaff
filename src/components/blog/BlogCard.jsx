import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { formatDate } from '@/lib/blogParse';

// One article in a list: the blog page and the "More guides" row under an
// article. `article` comes from lib/blog.js.
export default function BlogCard({ article }) {
  return (
    <article className="h-full">
      <Link
        href={`/blog/${article.slug}`}
        className="group bg-white border border-gray-200 rounded-2xl p-6 md:p-7 shadow-sm hover:shadow-xl hover:border-brand-navy/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {article.readingMinutes} min read
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-black text-gray-900 mt-3 mb-3 leading-snug group-hover:text-brand-navy transition-colors">
          {article.title}
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed flex-1">{article.description}</p>

        <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-cta group-hover:text-brand-cta-hover transition-colors">
          Read the guide
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </Link>
    </article>
  );
}
