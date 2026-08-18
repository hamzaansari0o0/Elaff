import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Collection from '@/models/Collection';
import CollectionForm from '@/components/admin/CollectionForm';

export default async function EditCollectionPage({ params }) {
  const { id } = await params;
  await connectDB();
  const collection = await Collection.findById(id).lean().catch(() => null);

  if (!collection) {
    notFound();
  }

  return (
    <div>
      <h1 className="font-fraunces text-2xl font-black text-gray-900 mb-6">Edit Collection</h1>
      <CollectionForm
        collectionId={id}
        initialData={{
          title: collection.title,
          slug: collection.slug,
          description: collection.description,
          image: collection.image,
        }}
      />
    </div>
  );
}
