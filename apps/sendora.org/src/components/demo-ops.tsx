import { cancelMultisendTask, createMultisendTask, mockData, deleteMultisendTask } from '@/services/multisend-task';
export const DemoOps = () => {

    return <>
        <button onClick={async () => {
            const taskId = await createMultisendTask(mockData.task, mockData.taskItems)
            console.log({ taskId })
        }}>create multisend task</button>


        <button onClick={async () => {
            const result = await cancelMultisendTask(mockData.task.id)
            console.log({ result })
        }}>cancel a task </button>

        <button onClick={async () => {
            const result = await deleteMultisendTask(mockData.task.id)

            console.log({ result })
        }}>delete a task </button>
    </>
}