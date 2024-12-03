import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { EmptyPlaceholder } from "@/components/empty-placeholder"
import { DashboardHeader } from "@/components/header"
import { NewsletterCreateForm } from "@/components/newsletter-create-form"
import { UserAuthForm } from "@/components/user-auth-form"
import { NewsletterItem } from "@/components/newsletter-item"
import { DashboardShell } from "@/components/shell"
import _ from "lodash"
import voca from "voca"

export const metadata = {
  title: "Dashboard",
}

async function refetchUser(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  })
  return user
}

export default async function NewNewsletterPage() {
  let user = await getCurrentUser()

  // if(!user) {
  //   redirect(authOptions?.pages?.signIn || "/login")
  // }
  // user = await refetchUser(user.id)
  // if (!user) {
  //   redirect(authOptions?.pages?.signIn || "/login")
  // }
  // if(!user.username) {
  //   redirect("/dashboard/setup")
  // }

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

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Newsletter"
        text="Let's create a new newsletter."
      ></DashboardHeader>
      {user ? <NewsletterCreateForm /> : <UserAuthForm />}
    </DashboardShell>
  )
}
