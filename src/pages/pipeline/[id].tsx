import React from 'react';
import Head from 'next/head';
import StaffLayout from '@/layouts/StaffLayout/StaffLayout';
import PipelineIdeaDetails from '@/modules/pipeline/components/PipelineIdeaDetails';

export default function PipelineIdeaPage() {
  return (
    <>
      <Head>
        <title>Idea Details | ConnectNigeria</title>
      </Head>
      <StaffLayout>
        <PipelineIdeaDetails />
      </StaffLayout>
    </>
  );
}
