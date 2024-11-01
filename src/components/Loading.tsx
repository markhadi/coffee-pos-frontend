const Loading = () => {
  return (
    <div className="h-screen bg-neutral-50 grid place-content-center">
      <div className="flex flex-col gap-2 items-center justify-center">
        <div className="border-[8px] border-neutral-200 rounded-full border-t-[8px] border-t-indigo-500 w-10 h-10 animate-spin"></div>
        <span>Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
