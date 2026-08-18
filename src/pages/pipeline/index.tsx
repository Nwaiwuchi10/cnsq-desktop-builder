import React from 'react';
import Head from 'next/head';
import StaffLayout from '@/layouts/StaffLayout/StaffLayout';
import PipelineDashboard from '@/modules/pipeline/components/PipelineDashboard';

export default function PipelinePage() {
  return (
    <>
      <Head>
        <title>Pipeline | ConnectNigeria</title>
      </Head>
      <StaffLayout>
        <PipelineDashboard />
      </StaffLayout>
    </>
  );
}
