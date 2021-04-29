import { MockedInterface, mockInterface } from '../testing'
import { ErrorHandle } from './error-handle'
import { IHandle } from './handle'

const VALUE_1 = 'VALUE_1'

describe('ErrorHandle', () => {
  let mockHandle: MockedInterface<IHandle<any>>
  let errorHandle: ErrorHandle

  beforeEach(() => {
    mockHandle = mockInterface()
    errorHandle = new ErrorHandle(mockHandle)
  })

  it('Should call property', async () => {
    await errorHandle.property(VALUE_1)
    expect(mockHandle.property).toBeCalledTimes(1)
    expect(mockHandle.property).toBeCalledWith(VALUE_1)
  })

  it('Should call exec', async () => {
    await errorHandle.exec(VALUE_1)
    expect(mockHandle.exec).toBeCalledTimes(1)
    expect(mockHandle.exec).toBeCalledWith(VALUE_1)
  })

  it('Should call value', async () => {
    await errorHandle.value()
    expect(mockHandle.value).toBeCalledTimes(1)
  })

  it('Should call set', async () => {
    await errorHandle.set(VALUE_1)
    expect(mockHandle.set).toBeCalledTimes(1)
    expect(mockHandle.set).toBeCalledWith(VALUE_1)
  })

  it('Should call delete', async () => {
    await errorHandle.delete()
    expect(mockHandle.delete).toBeCalledTimes(1)
  })

  it('Should call dispose', async () => {
    await errorHandle.dispose()
    expect(mockHandle.dispose).toBeCalledTimes(1)
  })
})