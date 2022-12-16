import { NextFunction, Request, Response } from 'express'
import axios, { AxiosError } from 'axios'

// Need this flag here temporarily, as we're missing implementation from another team.
const enabled = false

export default async function validateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (enabled) return next()
  const url = 'http://lamini5.uvm.sdu.dk:30080/api/user?id=' + req.headers.id

  const result = await axios.get(url).catch((err: AxiosError) => {
    console.error(err)
    res.sendStatus(403)
  })

  if (result) next()
}
