import { Result } from "../results"
import { Action } from "../actions"
import { EventData, IMessagePort } from "./message-port"

export function sendAction<T extends Result>(messagePort: IMessagePort, action: Action): Promise<T> {
  return new Promise<T>(res => {
    const onMessage = ({ data }: EventData<Result>) => {
      if (data.id === action.id) {
        messagePort.removeEventListener('message', onMessage)
        res(data as any)
      }
    }

    messagePort.addEventListener('message', onMessage)
    messagePort.postMessage<Action>(action)
  })
}
