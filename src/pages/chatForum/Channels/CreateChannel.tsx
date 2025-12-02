"use client";

const CreateChannelForm = () => {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Create a Channel</h2>

      <input
        type="text"
        placeholder="Channel Name"
        className="block w-full border p-3 rounded-lg"
      />
      <button className="mt-4 px-5 py-2 bg-lime-500 text-white rounded-lg">
        Create Channel
      </button>
    </div>
  );
};

export default CreateChannelForm;
