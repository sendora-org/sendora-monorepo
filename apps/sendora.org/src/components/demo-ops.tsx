import {
  cancelMultisendTask,
  createMultisendTask,
  deleteMultisendTask,
  dequeueTaskItem,
} from '@/services/multisend-task';
export const DemoOps = ({ task }: any) => {
  return (
    <>
      {/* <button
        onClick={async () => {
          const taskId = await createMultisendTask(
            mockData.task,
            mockData.taskItems,
          );
          console.log({ taskId });
        }}
      >
        create multisend task
      </button> */}

      <button
        onClick={async () => {
          const result = await cancelMultisendTask(task.id);
          console.log({ result });
        }}
      >
        cancel a task{' '}
      </button>

      <button
        onClick={async () => {
          const result = await deleteMultisendTask(task.id);

          console.log({ result });
        }}
      >
        delete a task{' '}
      </button>

      <button
        onClick={async () => {
          const result = await dequeueTaskItem(task.id);
          console.log({ result });
        }}
      >
        dequeue a task
      </button>
    </>
  );
};
