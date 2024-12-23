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
import _ from "lodash"
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
  const newsletterId = newsletter.id

  const subscribers = await db.subscriber.findMany({
    where: {
      newsletterId,
      status: SubscriberStatus.VERIFIED,
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
  const deliveredStats = await db.outboundEmail.groupBy({
    by: ["subscriberId", "postmarkDeliveredAt"],
    where: {
      newsletterId,
      status: OutboundEmailStatus.SENT,
      postmarkDeliveredAt: {
        not: null,
      },
    },
  })

  const openedStats = await db.outboundEmail.groupBy({
    by: ["subscriberId", "postmarkOpenedAt"],
    where: {
      newsletterId,
      status: OutboundEmailStatus.SENT,
      postmarkOpenedAt: {
        not: null,
      },
    },
  })

  const deliveredForSubscriber = _.groupBy(deliveredStats, "subscriberId")
  const openedForSubscriber = _.groupBy(openedStats, "subscriberId")
  console.log("delivered stats", deliveredForSubscriber)
  console.log("opened stats", openedForSubscriber)

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`${newsletter?.name} subscribers`}
        text="Subscribers for your newsletter."
      />
      <div className="grid gap-6">
        <DashboardNav
          items={dashboardConfig.sidebarNav}
          basePath={"/dashboard/" + newsletter.username}
          currentPath={"/dashboard/" + newsletter.username + "/subscribers"}
        />
        <div className="grid gap-4 px-2 md:grid-cols-2 lg:grid-cols-2">
          <ImportSubscribersButton
            url={"/dashboard/" + newsletter.username + "/subscribers/import"}
          />
          <ExportSubscribersButton
            url={"/api/newsletters/" + newsletter.username + "/subscribers/csv"}
          />
        </div>

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
              {deliveredStats.length > 0 ? (
                <TableHead className="h-8 w-[80px] px-1 py-1 text-center">
                  Delivered
                </TableHead>
              ) : (
                <></>
              )}
              {openedStats.length > 0 ? (
                <TableHead className="h-8 w-[60px] px-1 py-1 text-center">
                  Opened
                </TableHead>
              ) : (
                <></>
              )}
              <TableHead className="h-8 w-[100px] px-1 py-1 text-left">
                Location
              </TableHead>
              <TableHead className="h-8 w-[24px] px-1 py-1 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="py-1 text-left">
                  {subscriber.email}
                </TableCell>
                <TableCell className="py-1 text-left">
                  {subscriber.status}
                </TableCell>
                <TableCell className="py-1 text-left">
                  {moment(subscriber.createdAt).format("YYYY-MM-DD")}
                </TableCell>
                <TableCell className="w-[40px] px-1 py-1 text-center">
                  {subscriber._count.outboundEmails}
                </TableCell>
                {deliveredStats.length > 0 ? (
                  <TableCell className="w-[80px] px-1 py-1 text-center">
                    {(deliveredForSubscriber[subscriber.id] || []).length}
                  </TableCell>
                ) : (
                  <></>
                )}
                {openedStats.length > 0 ? (
                  <TableCell className="w-[60px] px-1 py-1 text-center">
                    {(openedForSubscriber[subscriber.id] || []).length}
                  </TableCell>
                ) : (
                  <></>
                )}
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
