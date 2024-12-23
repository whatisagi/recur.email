import { notFound, redirect } from "next/navigation"
import { Newsletter, OutboundEmailStatus, User } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { NewsletterSettingsForm } from "@/components/newsletter-settings-form"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Mail } from "lucide-react"
import moment from "moment"
import numeral from "numeral"
import { DashboardNav } from "@/components/nav"
import { dashboardConfig } from "@/config/dashboard"

async function getNewsletterForUser(
  username: Newsletter["username"],
  userId: User["id"]
) {
  return await db.newsletter.findFirst({
    where: {
      username,
      userId,
    },
    include: {
      user: true,
    },
  })
}

interface NewsletterSettingsPageProps {
  params: { newsletterId: string }
}

export default async function NewsletterSettingsPage({
  params,
}: NewsletterSettingsPageProps) {
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

  const newsletter = await getNewsletterForUser(params.newsletterId, user.id)

  if (!newsletter) {
    notFound()
  }
  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${newsletter?.name} settings`}
        text="Settings for your newsletter."
      />
      <div className="grid gap-6">
        <DashboardNav
          items={dashboardConfig.sidebarNav}
          basePath={"/dashboard/" + newsletter.username}
          currentPath={"/dashboard/" + newsletter.username + "/settings"}
        />
        <NewsletterSettingsForm newsletter={newsletter} />
      </div>
    </DashboardShell>
  )
}
