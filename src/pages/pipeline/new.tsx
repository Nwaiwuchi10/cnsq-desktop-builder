import React from 'react';
import Head from 'next/head';
import StaffLayout from '@/layouts/StaffLayout/StaffLayout';
import SubmitIdeaForm from '@/modules/pipeline/components/SubmitIdeaForm';

export default function NewPipelineIdeaPage() {
  return (
    <>
      <Head>
        <title>New Idea | ConnectNigeria</title>
      </Head>
      <StaffLayout>
        <SubmitIdeaForm />
      </StaffLayout>
    </>
  );
}
