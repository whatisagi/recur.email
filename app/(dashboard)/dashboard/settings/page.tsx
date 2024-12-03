import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { UserNameForm } from "@/components/user-name-form"
import { UserUrlsForm } from "@/components/user-urls-form"
import { User } from "@prisma/client"
import { db } from "@/lib/db"

export const metadata = {
  title: "Settings",
  description: "Manage account and settings.",
}

export default async function SettingsPage() {
  let user = await getCurrentUser()

  user = {
    id: "9bfa9358-2ed9-4e66-963b-7900ee21a4b7",
    name: null,
    email: null,
    emailVerified: new Date("2022-01-01"),
    publicEmail: null,
    image: "https://placekitten.com/372/169",
    createdAt: new Date("2022-01-01"),
    updatedAt: new Date("2022-01-01"),
    url: "https://chase.com/",
    twitter: "isaacwaters",
  }

  // if (!user) {
  //   redirect(authOptions?.pages?.signIn || "/login")
  // }
  user = await db.user.findUnique({
    where: {
      id: user.id,
    },
  })

  user = {
    id: "9bfa9358-2ed9-4e66-963b-7900ee21a4b7",
    name: null,
    email: null,
    emailVerified: new Date("2022-01-01"),
    publicEmail: null,
    image: "https://placekitten.com/372/169",
    createdAt: new Date("2022-01-01"),
    updatedAt: new Date("2022-01-01"),
    url: "https://chase.com/",
    twitter: "isaacwaters",
  }

  // if (!user) {
  //   redirect(authOptions?.pages?.signIn || "/login")
  // }
  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage account and settings." />
      <div className="grid gap-10">
        <UserNameForm user={{ id: user.id, name: user.name || "" }} />
        <UserUrlsForm
          user={{
            id: user.id,
            url: user.url || "",
            twitter: user.twitter || "",
          }}
        />
      </div>
    </DashboardShell>
  )
}
