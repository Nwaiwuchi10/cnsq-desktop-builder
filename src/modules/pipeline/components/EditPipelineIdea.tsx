import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SubmitIdeaForm from './SubmitIdeaForm';
import { fetchPipelineIdea } from '../services/pipeline.service';
import { PipelineIdea } from '../types/pipeline.types';

export default function EditPipelineIdea() {
  const router = useRouter();
  const { id } = router.query;
  const [idea, setIdea] = useState<PipelineIdea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadIdea();
    }
  }, [id]);

  const loadIdea = async () => {
    try {
      const data = await fetchPipelineIdea(id as string);
      setIdea(data);
    } catch (error) {
      console.error('Failed to fetch idea', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center p-12 text-gray-500">Loading...</div>;
  }

  if (!idea) {
    return <div className="w-full h-full flex items-center justify-center p-12 text-gray-500">Idea not found.</div>;
  }

  return <SubmitIdeaForm initialData={idea} />;
}
