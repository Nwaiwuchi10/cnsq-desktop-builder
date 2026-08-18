import React from 'react';
import Head from 'next/head';
import StaffLayout from '@/layouts/StaffLayout/StaffLayout';
import EditPipelineIdea from '@/modules/pipeline/components/EditPipelineIdea';

export default function EditPipelineIdeaPage() {
  return (
    <>
      <Head>
        <title>Edit Idea | ConnectNigeria</title>
      </Head>
      <StaffLayout>
        <EditPipelineIdea />
      </StaffLayout>
    </>
  );
}
