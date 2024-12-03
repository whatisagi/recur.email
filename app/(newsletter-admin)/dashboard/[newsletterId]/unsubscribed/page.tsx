import { notFound, redirect } from "next/navigation"
import {
  Newsletter,
  OutboundEmailStatus,
  User,
  SubscriberStatus,
} from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { NewsletterSettingsForm } from "@/components/newsletter-settings-form"
import { db } from "@/lib/db"
import { DollarSign, Users, Mail } from "lucide-react"
import moment from "moment"
import numeral from "numeral"
import { DashboardNav } from "@/components/nav"
import { dashboardConfig } from "@/config/dashboard"
import { ImportSubscribersButton } from "@/components/import-subscribers-button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SubscriberOperations } from "@/components/subscriber-operations"
import { ExportSubscribersButton } from "@/components/export-subscribers-button"
import { formatLocation } from "@/lib/utils"

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

  // if (!user) {
  //   redirect(authOptions?.pages?.signIn || "/login")
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

  const newsletter = await getNewsletterForUser(params.newsletterId, user.id)

  if (!newsletter) {
    notFound()
  }
  const newsletterId = newsletter.id

  const subscribers = await db.subscriber.findMany({
    where: {
      newsletterId,
      status: SubscriberStatus.UNSUBSCRIBED,
    },
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      clientIPCity: true,
      clientIPCountry: true,
      _count: {
        select: {
          outboundEmails: {
            where: {
              status: OutboundEmailStatus.SENT,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  console.log(subscribers)

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${newsletter?.name} subscribers`}
        text="Unsubscribed subscribers."
      />
      <div className="grid gap-6">
        <DashboardNav
          items={dashboardConfig.sidebarNav}
          basePath={"/dashboard/" + newsletter.username}
          currentPath={"/dashboard/" + newsletter.username + "/unsubscribed"}
        />
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 w-[140px] px-2 py-1 text-left">
                Email
              </TableHead>
              <TableHead className="h-8 w-[80px] px-2 py-1 text-left">
                Status
              </TableHead>
              <TableHead className="h-8 w-[100px] px-2 py-1 text-left">
                Date
              </TableHead>
              <TableHead className="h-8 w-[40px] px-1 py-1 text-center">
                Sent
              </TableHead>
              <TableHead className="h-8 w-[100px] px-1 py-1 text-left">
                Location
              </TableHead>
              <TableHead className="h-8 w-[24px] px-1 py-1 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="py-1 text-left ">
                  {subscriber.email}
                </TableCell>
                <TableCell className="py-1 text-left ">
                  {subscriber.status}
                </TableCell>
                <TableCell className="py-1 text-left ">
                  {moment(subscriber.createdAt).format("YYYY-MM-DD")}
                </TableCell>
                <TableCell className="w-[40px] px-1 py-1 text-center">
                  {subscriber._count.outboundEmails}
                </TableCell>
                <TableCell className="w-[100px] px-1 py-1 text-left">
                  {formatLocation(subscriber)}
                </TableCell>
                <TableCell className="py-1 pl-2 pr-1 text-right">
                  <SubscriberOperations
                    subscriber={subscriber}
                    newsletter={newsletter}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  )
}
