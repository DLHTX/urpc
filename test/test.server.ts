
import { Hono } from 'hono'
import { cors } from "hono/cors"
import { URPC } from "../src/urpc";
import { createServerClient } from '../src/client';
import { applyPatch } from 'fast-json-patch';


let data = {
  foo: 123,
  bar: "test1234",
  enums: ["apple", "orange"],
  collections: [{ name: "Data1" }, { name: "Data2" }]
};

const func1 = URPC.Func({
  input: { add_fruit: "banana", fruits: [] },
  func: ({ input }) => data.enums.push(input.add_fruit),
  uiConfig: () => ({
    fruits: {
      selectOptions: data.enums.map(i => ({ label: i, value: i }))
    }
  })
})


// server
export const urpc = new URPC({
  schemas: {
    func1,
    data: URPC.Var({
      get: () => data,
      patch: (ops) => {
        ops.forEach(i => {
          if (i.op == "replace") {
            // TODO
          }
        })
        return applyPatch(data, ops)
      },
    }),
    object: {
      object1: {
        sum1: URPC.Func({
          input: { a: 0, b: 0 },
          func: ({ input }) => input.a + input.b,
        }),
        data1: URPC.Var({ get: () => data }),
      }
    },
  },
});


export const serverClient = createServerClient({ urpc })

const app = new Hono()
app.use(cors())
app.post('/urpc', async (c) => {
  const body = await c.req.json() as any
  const res = await serverClient.handle(body)
  return c.json(res)
})

export default app