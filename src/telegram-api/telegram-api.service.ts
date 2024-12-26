import { Injectable } from "@nestjs/common"
import { Api, TelegramClient } from "telegram"
import { StoreSession } from "telegram/sessions"

import Photo = Api.Photo
import { Buffer } from "buffer"

@Injectable()
export class TelegramApiService {
  private client: TelegramClient
  private storeSession = new StoreSession("my_session")

  // Avatars
  private avatarsQueue: (() => Promise<void>)[] = []
  private downloadedAvatars = 0
  private isProcessingInAvatarQueue = false
  private inFlightAvatarPromises: Map<string, Promise<Buffer>> = new Map()

  constructor() {
    this.client = new TelegramClient(
      this.storeSession,
      Number(process.env.TELEGRAM_API_ID),
      process.env.TELEGRAM_API_HASH!,
      {
        connectionRetries: 5,
      }
    )

    this.client.start({
      botAuthToken: process.env.TELEGRAM_BOT_TOKEN,
    })
  }

  async getUserByUsername(username: string) {
    const result = await this.client.invoke(
      new Api.users.GetUsers({
        id: [username],
      })
    )
    return result
  }

  async getUserAvatar(username: string): Promise<Buffer> {
    if (this.inFlightAvatarPromises.has(username)) {
      return this.inFlightAvatarPromises.get(username)!
    }

    const avatarPromise = new Promise<Buffer>((resolve, reject) => {
      const task = async () => {
        try {
          if (this.downloadedAvatars % 4 === 0 && this.downloadedAvatars !== 0)
            // TODO: sometime api return api rate limit exceed, catch time to wait before retry, 10 seconds is a default
            await new Promise((resolve) => setTimeout(resolve, 10_000))
          this.downloadedAvatars += 1
          const result = await this.client.invoke(
            new Api.photos.GetUserPhotos({
              userId: username,
            })
          )

          const photo = result.photos[0] as Photo
          const fr = photo.fileReference

          const res = await this.client.downloadFile(
            new Api.InputPhotoFileLocation({
              id: photo.id,
              accessHash: photo.accessHash,
              fileReference: fr,
              thumbSize: "c",
            }),
            {
              dcId: photo.dcId,
            }
          )

          if (Buffer.isBuffer(res)) {
            console.log(res)
            resolve(res)
          } else {
            throw new Error("Failed to download photo as a Buffer")
          }
        } catch (error) {
          reject(error)
        } finally {
          this.inFlightAvatarPromises.delete(username)
          this.processAvatarsQueue()
        }
      }
      this.avatarsQueue.push(task)

      if (!this.isProcessingInAvatarQueue) {
        this.processAvatarsQueue()
      }
    })

    this.inFlightAvatarPromises.set(username, avatarPromise)

    return avatarPromise
  }

  private async processAvatarsQueue(): Promise<void> {
    if (this.avatarsQueue.length === 0) {
      this.isProcessingInAvatarQueue = false
      return
    }

    this.isProcessingInAvatarQueue = true
    const nextTask = this.avatarsQueue.shift()
    if (nextTask) {
      await nextTask()
    }
  }
}
