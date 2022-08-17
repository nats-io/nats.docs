import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'

import { LogoColored } from '@/components/Logo'
import { MobileNavigation } from '@/components/MobileNavigation'
import { Navigation } from '@/components/Navigation'
import { Prose } from '@/components/Prose'
import { Search } from '@/components/Search'
import { ThemeSelector } from '@/components/ThemeSelector'
import Markdoc from "@markdoc/markdoc"

function liToLink(node) {
  const a = node.children[0]
  const ul = node.children[1]

  if (ul) {
    return {
      title: a.children[0], href: "/" + a.attributes.href.replace("", ""), links: ul.children.map(liToLink)
    }
  }

  return { title: a.children[0], href: "/" + a.attributes.href.replace("", "") }
}

function astToNavigation(ast) {
  let sections = []
  ast.children.forEach(child => {
    switch (child.name) {
      case "h2":
        sections.push({ title: child.children[0] })
        break;
      case "ul":
        if (sections.length > 0) {
          sections[sections.length - 1].links = child.children.map(liToLink)
        }
        break;

      default:
        break;
    }
  })

  return sections
}

var ast = Markdoc.transform(Markdoc.parse(`
## Release Notes

* [What's New!](release_notes/whats_new)
  * [NATS 2.2](release_notes/whats_new_22)
  * [NATS 2.0](release_notes/whats_new_20)

## NATS Concepts

* [Overview](overview)
  * [Compare NATS](nats-concepts/overview/compare-nats)
* [What is NATS](nats-concepts/what-is-nats)
  * [Walkthrough Setup](nats-concepts/what-is-nats/walkthrough_setup)
* [Subject-Based Messaging](nats-concepts/subjects)
* [Core NATS](nats-concepts/core-nats)
  * [Publish-Subscribe](nats-concepts/core-nats/publish-subscribe/pubsub)
    * [Pub/Sub Walkthrough](nats-concepts/core-nats/publish-subscribe/pubsub_walkthrough)
  * [Request-Reply](nats-concepts/core-nats/request-reply/reqreply)
    * [Request-Reply Walkthrough](nats-concepts/core-nats/request-reply/reqreply_walkthrough)
  * [Queue Groups](nats-concepts/core-nats/queue-groups/queue)
    * [Queueing Walkthrough](nats-concepts/core-nats/queue-groups/queues_walkthrough)
* [JetStream](nats-concepts/jetstream)
  * [Streams](nats-concepts/jetstream/streams)
  * [Consumers](nats-concepts/jetstream/consumers)
    * [Example](nats-concepts/jetstream/example_configuration)
  * [JetStream Walkthrough](nats-concepts/jetstream/js_walkthrough)
  * [Key/Value Store](nats-concepts/jetstream/key-value-store)
    * [Key/Value Store Walkthrough](nats-concepts/jetstream/key-value-store/kv_walkthrough)
  * [Object Store](nats-concepts/jetstream/object-store/obj_store)
    * [Object Store Walkthrough](nats-concepts/jetstream/object-store/obj_walkthrough)
* [Subject Mapping and Partitioning](nats-concepts/subject_mapping)
* [NATS Service Infrastructure](nats-concepts/service_infrastructure)
  * [NATS Adaptive Deployment Architectures](nats-concepts/adaptive_edge_deployment)
* [Security](nats-concepts/security)
* [Connectivity](nats-concepts/connectivity)

## Using NATS

* [NATS Tools](using-nats/nats-tools)
  * [nats](using-nats/nats-tools/nats_cli)
    * [nats bench](using-nats/nats-tools/nats_cli/natsbench)
  * [nk](using-nats/nats-tools/nk)
  * [nsc](using-nats/nats-tools/nsc)
    * [Basics](using-nats/nats-tools/nsc/basics)
    * [Streams](using-nats/nats-tools/nsc/streams)
    * [Services](using-nats/nats-tools/nsc/services)
    * [Signing Keys](using-nats/nats-tools/nsc/signing_keys)
    * [Revocation](using-nats/nats-tools/nsc/revocation)
    * [Managed Operators](using-nats/nats-tools/nsc/managed)
  * [nats-top](using-nats/nats-tools/nats_top)
    * [Tutorial](using-nats/nats-tools/nats_top/nats-top-tutorial)
* [Developing With NATS](using-nats/developing-with-nats/developer)
  * [Anatomy of a NATS application](using-nats/developing-with-nats/anatomy)
  * [Connecting](using-nats/developing-with-nats/connecting)
    * [Connecting to the Default Server](using-nats/developing-with-nats/connecting/default_server)
    * [Connecting to a Specific Server](using-nats/developing-with-nats/connecting/specific_server)
    * [Connecting to a Cluster](using-nats/developing-with-nats/connecting/cluster)
    * [Connection Name](using-nats/developing-with-nats/connecting/name)
    * [Authenticating with a User and Password](using-nats/developing-with-nats/connecting/security/userpass)
    * [Authenticating with a Token](using-nats/developing-with-nats/connecting/security/token)
    * [Authenticating with an NKey](using-nats/developing-with-nats/connecting/security/nkey)
    * [Authenticating with a Credentials File](using-nats/developing-with-nats/connecting/security/creds)
    * [Encrypting Connections with TLS](using-nats/developing-with-nats/connecting/security/tls)
    * [Setting a Connect Timeout](using-nats/developing-with-nats/connecting/connect_timeout)
    * [Ping/Pong Protocol](using-nats/developing-with-nats/connecting/pingpong)
    * [Turning Off Echo'd Messages](using-nats/developing-with-nats/connecting/noecho)
    * [Miscellaneous functionalities](using-nats/developing-with-nats/connecting/misc)
    * [Automatic Reconnections](using-nats/developing-with-nats/reconnect)
      * [Disabling Reconnect](using-nats/developing-with-nats/reconnect/disable)
      * [Set the Number of Reconnect Attempts](using-nats/developing-with-nats/reconnect/max)
      * [Avoiding the Thundering Herd](using-nats/developing-with-nats/reconnect/random)
      * [Pausing Between Reconnect Attempts](using-nats/developing-with-nats/reconnect/wait)
      * [Listening for Reconnect Events](using-nats/developing-with-nats/reconnect/events)
      * [Buffering Messages During Reconnect Attempts](using-nats/developing-with-nats/reconnect/buffer)
    * [Monitoring the Connection](using-nats/developing-with-nats/events)
      * [Listen for Connection Events](using-nats/developing-with-nats/events/events)
      * [Slow Consumers](using-nats/developing-with-nats/events/slow)
  * [Receiving Messages](using-nats/developing-with-nats/receiving)
    * [Synchronous Subscriptions](using-nats/developing-with-nats/receiving/sync)
    * [Asynchronous Subscriptions](using-nats/developing-with-nats/receiving/async)
    * [Unsubscribing](using-nats/developing-with-nats/receiving/unsubscribing)
    * [Unsubscribing After N Messages](using-nats/developing-with-nats/receiving/unsub_after)
    * [Replying to a Message](using-nats/developing-with-nats/receiving/reply)
    * [Wildcard Subscriptions](using-nats/developing-with-nats/receiving/wildcards)
    * [Queue Subscriptions](using-nats/developing-with-nats/receiving/queues)
    * [Draining Messages Before Disconnect](using-nats/developing-with-nats/receiving/drain)
    * [Receiving Structured Data](using-nats/developing-with-nats/receiving/structure)
  * [Sending Messages](using-nats/developing-with-nats/sending)
    * [Including a Reply Subject](using-nats/developing-with-nats/sending/replyto)
    * [Request-Reply Semantics](using-nats/developing-with-nats/sending/request_reply)
    * [Caches, Flush and Ping](using-nats/developing-with-nats/sending/caches)
    * [Sending Structured Data](using-nats/developing-with-nats/sending/structure)
  * [JetStream](using-nats/jetstream/develop_jetstream)
    * [JetStream Model Deep Dive](using-nats/jetstream/model_deep_dive)
    * [Managing Streams and consumers](using-nats/developing-with-nats/js/streams)
    * [Publishing to Streams](using-nats/developing-with-nats/js/publish)
    * [Using the Key/Value Store](using-nats/developing-with-nats/js/kv)
    * [Using the Object Store](using-nats/developing-with-nats/js/object)
  * [Tutorials](using-nats/developing-with-nats/tutorials)
    * [Advanced Connect and Custom Dialer in Go](using-nats/developing-with-nats/tutorials/custom_dialer)

## Running a NATS service

* [Installing, running and deploying a NATS Server](running-a-nats-service/introduction)
  * [Installing a NATS Server](running-a-nats-service/installation)
  * [Running and deploying a NATS Server](running-a-nats-service/running)
  * [Windows Service](running-a-nats-service/running/windows_srv)
  * [Flags](running-a-nats-service/running/flags)
* [Environmental considerations](running-a-nats-service/environment)
* [NATS and Docker](running-a-nats-service/running/nats_docker)
  * [Tutorial](running-a-nats-service/running/nats_docker/nats-docker-tutorial)
  * [Docker Swarm](running-a-nats-service/running/nats_docker/docker_swarm)
  * [Python and NGS Running in Docker](running-a-nats-service/running/nats_docker/ngs-docker-python)
  * [JetStream](running-a-nats-service/running/nats_docker/jetstream_docker)
* [NATS and Kubernetes](running-a-nats-service/nats-on-kubernetes/nats-kubernetes)
  * [Deploying NATS with Helm](running-a-nats-service/nats-on-kubernetes/helm-charts)
  * [Creating a Kubernetes Cluster](running-a-nats-service/nats-on-kubernetes/create-k8s-cluster)
  * [NATS Cluster and Cert Manager](running-a-nats-service/nats-on-kubernetes/nats-cluster-and-cert-manager)
  * [Securing a NATS Cluster with cfssl](running-a-nats-service/nats-on-kubernetes/operator-tls-setup-with-cfssl)
  * [Using a Load Balancer for External Access to NATS](running-a-nats-service/nats-on-kubernetes/nats-external-nlb)
  * [Creating a NATS Super Cluster in Digital Ocean with Helm](running-a-nats-service/nats-on-kubernetes/super-cluster-on-digital-ocean)
  * [From Zero to K8S to Leafnodes using Helm](running-a-nats-service/nats-on-kubernetes/from-zero-to-leafnodes)
* [NATS Server Clients](running-a-nats-service/clients)
* [Configuring NATS Server](running-a-nats-service/configuration)
  * [Configuring JetStream](running-a-nats-service/configuration/jetstream-config/resource_management)
    * [Configuration Management](running-a-nats-service/configuration/jetstream-config/configuration_mgmt)
      * [NATS Admin CLI](running-a-nats-service/configuration/jetstream-config/configuration_mgmt/nats-admin-cli)
      * [Terraform](running-a-nats-service/configuration/jetstream-config/configuration_mgmt/terraform)
      * [GitHub Actions](running-a-nats-service/configuration/jetstream-config/configuration_mgmt/github_actions)
      * [Kubernetes Controller](running-a-nats-service/configuration/jetstream-config/configuration_mgmt/kubernetes_controller)
  * [Clustering](running-a-nats-service/configuration/clustering)
    * [Clustering Configuration](running-a-nats-service/configuration/clustering/cluster_config)
    * [JetStream Clustering](running-a-nats-service/configuration/clustering/jetstream_clustering)
      * [Administration](running-a-nats-service/configuration/clustering/jetstream_clustering/administration)
  * [Super-cluster with Gateways](running-a-nats-service/configuration/gateways)
    * [Configuration](running-a-nats-service/configuration/gateways/gateway)
  * [Leaf Nodes](running-a-nats-service/configuration/leafnodes)
    * [Configuration](running-a-nats-service/configuration/leafnodes/leafnode_conf)
    * [JetStream on Leaf Nodes](running-a-nats-service/configuration/leafnodes/jetstream_leafnodes)
  * [Securing NATS](running-a-nats-service/configuration/securing_nats)
    * [Enabling TLS](running-a-nats-service/configuration/securing_nats/tls)
    * [Authentication](running-a-nats-service/configuration/securing_nats/auth_intro)
      * [Tokens](running-a-nats-service/configuration/securing_nats/auth_intro/tokens)
      * [Username/Password](running-a-nats-service/configuration/securing_nats/auth_intro/username_password)
      * [TLS Authentication](running-a-nats-service/configuration/securing_nats/auth_intro/tls_mutual_auth)
        * [TLS Authentication in clusters](running-a-nats-service/configuration/clustering/cluster_tls)
      * [NKeys](running-a-nats-service/configuration/securing_nats/auth_intro/nkey_auth)
      * [Authentication Timeout](running-a-nats-service/configuration/securing_nats/auth_intro/auth_timeout)
      * [Decentralized JWT Authentication/Authorization](running-a-nats-service/configuration/securing_nats/jwt)
        * [Account lookup using Resolver](running-a-nats-service/configuration/securing_nats/jwt/resolver)
        * [Memory Resolver Tutorial](running-a-nats-service/configuration/securing_nats/jwt/mem_resolver)
        * [Mixed Authentication/Authorization Setup](running-a-nats-service/configuration/securing_nats/jwt/jwt_nkey_auth)
    * [Authorization](running-a-nats-service/configuration/securing_nats/authorization)
    * [Multi Tenancy using Accounts](running-a-nats-service/configuration/securing_nats/accounts)
    * [OCSP Stapling](running-a-nats-service/configuration/ocsp)
  * [Logging](running-a-nats-service/configuration/logging)
  * [Enabling Monitoring](running-a-nats-service/configuration/monitoring)
  * [MQTT](running-a-nats-service/configuration/mqtt)
    * [Configuration](running-a-nats-service/configuration/mqtt/mqtt_config)
  * [Configuring Subject Mapping](running-a-nats-service/configuration/configuring_subject_mapping)
  * [System Events](running-a-nats-service/configuration/sys_accounts)
    * [System Events & Decentralized JWT Tutorial](running-a-nats-service/configuration/sys_accounts/sys_accounts)
  * [WebSocket](running-a-nats-service/configuration/websocket)
    * [Configuration](running-a-nats-service/configuration/websocket/websocket_conf)
* [Managing and Monitoring your NATS Server Infrastructure](running-a-nats-service/nats_admin)
  * [Monitoring](running-a-nats-service/nats_admin/monitoring)
    * [Monitoring JetStream](running-a-nats-service/nats_admin/monitoring/monitoring_jetstream)
  * [Managing JetStream](running-a-nats-service/nats_admin/jetstream_admin)
    * [Account Information](running-a-nats-service/nats_admin/jetstream_admin/account)
    * [Naming Streams, Consumers, and Accounts](running-a-nats-service/nats_admin/jetstream_admin/naming)
    * [Streams](running-a-nats-service/nats_admin/jetstream_admin/streams)
    * [Consumers](running-a-nats-service/nats_admin/jetstream_admin/consumers)
    * [Data Replication](running-a-nats-service/nats_admin/jetstream_admin/replication)
    * [Disaster Recovery](running-a-nats-service/nats_admin/jetstream_admin/disaster_recovery)
    * [Encryption at Rest](running-a-nats-service/nats_admin/jetstream_admin/encryption_at_rest)
  * [Managing JWT Security](running-a-nats-service/nats_admin/security)
    * [In Depth JWT Guide](running-a-nats-service/nats_admin/jwt)
  * [Upgrading a Cluster](running-a-nats-service/nats_admin/upgrading_cluster)
  * [Slow Consumers](running-a-nats-service/nats_admin/slow_consumers)
  * [Signals](running-a-nats-service/nats_admin/signals)
  * [Lame Duck Mode](running-a-nats-service/nats_admin/lame_duck_mode)

## Reference

* [FAQ](reference/faq)
* [NATS Protocols](reference-protocols)
  * [Protocol Demo](reference/nats-protocol/nats-protocol-demo)
  * [Client Protocol](reference/nats-protocol/nats-protocol)
    * [Developing a Client](reference/nats-protocol/nats-protocol/nats-client-dev)
  * [NATS Cluster Protocol](reference/nats-protocol/nats-server-protocol)
  * [JetStream wire API Reference](using-nats/jetstream/nats_api_reference)

## Legacy

* [STAN aka 'NATS Streaming'](legacy/stan)
  * [STAN Concepts](legacy/stan/nats-streaming-concepts/intro)
    * [Relation to NATS](legacy/stan/nats-streaming-concepts/relation-to-nats)
    * [Client Connections](legacy/stan/nats-streaming-concepts/client-connections)
    * [Channels](legacy/stan/nats-streaming-concepts/channels)
      * [Message Log](legacy/stan/nats-streaming-concepts/channels/message-log)
      * [Subscriptions](legacy/stan/nats-streaming-concepts/channels/subscriptions)
        * [Regular](legacy/stan/nats-streaming-concepts/channels/subscriptions/regular)
        * [Durable](legacy/stan/nats-streaming-concepts/channels/subscriptions/durable)
        * [Queue Group](legacy/stan/nats-streaming-concepts/channels/subscriptions/queue-group)
        * [Redelivery](legacy/stan/nats-streaming-concepts/channels/subscriptions/redelivery)
    * [Store Interface](legacy/stan/nats-streaming-concepts/store-interface)
    * [Store Encryption](legacy/stan/nats-streaming-concepts/store-encryption)
    * [Clustering](legacy/stan/nats-streaming-concepts/clustering)
      * [Supported Stores](legacy/stan/nats-streaming-concepts/clustering/supported-stores)
      * [Configuration](legacy/stan/nats-streaming-concepts/clustering/configuration)
      * [Auto Configuration](legacy/stan/nats-streaming-concepts/clustering/auto-configuration)
      * [Containers](legacy/stan/nats-streaming-concepts/clustering/containers)
    * [Fault Tolerance](legacy/stan/nats-streaming-concepts/ft)
      * [Active Server](legacy/stan/nats-streaming-concepts/ft/active-server)
      * [Standby Servers](legacy/stan/nats-streaming-concepts/ft/standby-server)
      * [Shared State](legacy/stan/nats-streaming-concepts/ft/shared-state)
      * [Failover](legacy/stan/nats-streaming-concepts/ft/failover)
    * [Partitioning](legacy/stan/nats-streaming-concepts/partitioning)
    * [Monitoring](legacy/stan/nats-streaming-concepts/monitoring)
      * [Endpoints](legacy/stan/nats-streaming-concepts/monitoring/endpoints)
  * [Developing With STAN](legacy/stan/developing-with-nats-streaming/streaming)
    * [Connecting to NATS Streaming Server](legacy/stan/developing-with-nats-streaming/connecting)
    * [Publishing to a Channel](legacy/stan/developing-with-nats-streaming/publishing)
    * [Receiving Messages from a Channel](legacy/stan/developing-with-nats-streaming/receiving)
    * [Durable Subscriptions](legacy/stan/developing-with-nats-streaming/durables)
    * [Queue Subscriptions](legacy/stan/developing-with-nats-streaming/queues)
    * [Acknowledgements](legacy/stan/developing-with-nats-streaming/acks)
    * [The Streaming Protocol](legacy/stan/developing-with-nats-streaming/protocol)
  * [STAN NATS Streaming Server](legacy/stan/nats-streaming-server/changes)
    * [Installing](legacy/stan/nats-streaming-server/install)
    * [Running](legacy/stan/nats-streaming-server/run)
    * [Configuring](legacy/stan/nats-streaming-server/configuring)
      * [Command Line Arguments](legacy/stan/nats-streaming-server/configuring/cmdline)
      * [Configuration File](legacy/stan/nats-streaming-server/configuring/cfgfile)
      * [Store Limits](legacy/stan/nats-streaming-server/configuring/storelimits)
      * [Persistence](legacy/stan/nats-streaming-server/configuring/persistence)
        * [File Store](legacy/stan/nats-streaming-server/configuring/persistence/file_store)
        * [SQL Store](legacy/stan/nats-streaming-server/configuring/persistence/sql_store)
      * [Securing](legacy/stan/nats-streaming-server/configuring/tls)
    * [Process Signaling](legacy/stan/nats-streaming-server/process-signaling)
    * [Windows Service](legacy/stan/nats-streaming-server/windows-service)
    * [Embedding NATS Streaming Server](legacy/stan/nats-streaming-server/embedding)
    * [Docker Swarm](legacy/stan/nats-streaming-server/swarm)
    * [Kubernetes](legacy/stan/nats-streaming-server/kubernetes/stan-kubernetes)
      * [NATS Streaming with Fault Tolerance.](legacy/stan/nats-streaming-server/kubernetes/stan-ft-k8s-aws)
* [nats-account-server](legacy/nas)
  * [Basics](legacy/nas/nas_conf)
  * [Inspecting JWTs](legacy/nas/inspecting_jwts)
  * [Directory Store](legacy/nas/dir_store)
  * [Update Notifications](legacy/nas/notifications)
`), {})

const navigation = astToNavigation(ast)

function GitHubIcon(props) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
    </svg>
  )
}

function Header({ navigation }) {
  let [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll, { passive: true })
    }
  }, [])

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 flex flex-wrap items-center justify-between bg-white px-4 py-5 shadow-md shadow-slate-900/5 transition duration-500 dark:shadow-none sm:px-6 lg:px-8',
        isScrolled
          ? 'dark:bg-slate-900/95 dark:backdrop-blur dark:[@supports(backdrop-filter:blur(0))]:bg-slate-900/75'
          : 'dark:bg-transparent'
      )}
    >
      <div className="mr-6 flex lg:hidden">
        <MobileNavigation navigation={navigation} />
      </div>
      <div className="relative flex flex-grow basis-0 items-center">
        <Link href="/" aria-label="Home page">
          <LogoColored className="h-10 w-auto lg:block" />
        </Link>
      </div>
      <div className="-my-5 mr-6 sm:mr-8 md:mr-0">
        <Search />
      </div>
      <div className="relative flex basis-0 justify-end gap-6 sm:gap-8 md:flex-grow">
        <ThemeSelector className="relative z-10" />
        <Link href="https://github.com/nats-io" className="group" aria-label="GitHub">
          <GitHubIcon className="h-6 w-6 fill-slate-400 group-hover:fill-slate-500 dark:group-hover:fill-slate-300" />
        </Link>
      </div>
    </header>
  )
}

function useTableOfContents(tableOfContents) {
  let [currentSection, setCurrentSection] = useState(tableOfContents[0]?.id)

  let getHeadings = useCallback((tableOfContents) => {
    return tableOfContents
      .flatMap((node) => [node.id, ...node.children.map((child) => child.id)])
      .map((id) => {
        let el = document.getElementById(id)
        if (!el) return

        let style = window.getComputedStyle(el)
        let scrollMt = parseFloat(style.scrollMarginTop)

        let top = window.scrollY + el.getBoundingClientRect().top - scrollMt
        return { id, top }
      })
  }, [])

  useEffect(() => {
    if (tableOfContents.length === 0) return
    let headings = getHeadings(tableOfContents)
    function onScroll() {
      let top = window.scrollY
      let current = headings[0].id
      for (let heading of headings) {
        if (top >= heading.top) {
          current = heading.id
        } else {
          break
        }
      }
      setCurrentSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll, { passive: true })
    }
  }, [getHeadings, tableOfContents])

  return currentSection
}

export function Layout({ children, title, tableOfContents, markdoc }) {
  let router = useRouter()

  const getAllLinks = (children) => children.flatMap((c) => [c].concat(getAllLinks(c.links || [])))
  const getAllHrefs = ({ href, links = [] }) => [href].concat(links.map(getAllHrefs))

  let allLinks = getAllLinks(navigation.flatMap((section) => section.links))
  let linkIndex = allLinks.findIndex((link) => link.href === router.pathname)
  let previousPage = allLinks[linkIndex - 1]
  let nextPage = allLinks[linkIndex + 1]
  let section = navigation.find((section) => {
    return section.links.flatMap(getAllHrefs).flat(100).includes(router.pathname)
  }
  )
  let currentSection = useTableOfContents(tableOfContents)

  function isActive(section) {
    if (section.id === currentSection) {
      return true
    }
    if (!section.children) {
      return false
    }
    return section.children.findIndex(isActive) > -1
  }

  function githubLink() {
    if (markdoc) {
      // TODO: change this to master when we move to production
      return "https://github.com/nats-io/nats.docs/edit/JMS-NATS-Docs-2.0/src/pages/" + markdoc.file.path
    } else {
      return "https://github.com/nats-io/nats.docs"
    }
  }

  return (
    <>
      <Header navigation={navigation} />

      <div className="relative mx-auto flex max-w-8xl justify-center sm:px-2 lg:px-8 xl:px-12">
        <div className="hidden lg:relative lg:block lg:flex-none">
          <div className="absolute inset-y-0 right-0 w-[50vw] bg-slate-50 dark:hidden" />
          <div className="sticky top-[4.5rem] -ml-0.5 h-[calc(100vh-4.5rem)] overflow-y-auto py-16 pl-0.5">
            <div className="absolute top-16 bottom-0 right-0 hidden h-12 w-px bg-gradient-to-t from-slate-800 dark:block" />
            <div className="absolute top-28 bottom-0 right-0 hidden w-px bg-slate-800 dark:block" />
            <Navigation
              navigation={navigation}
              className="w-64 pr-8 xl:w-72 xl:pr-16"
            />
          </div>
        </div>
        <div className="min-w-0 max-w-2xl flex-auto px-4 py-16 lg:max-w-none lg:pr-0 lg:pl-8 xl:px-16">
          <article>
            {(title || section) && (
              <header className="mb-9 space-y-1">
                {section && (
                  <p className="font-display text-sm font-medium text-sky-500">
                    {section.title}
                  </p>
                )}
                {title && (
                  <h1 className="font-display text-3xl tracking-tight text-slate-900 dark:text-white">
                    {title}
                  </h1>
                )}
              </header>
            )}
            <Prose>{children}</Prose>
          </article>
          <dl className="mt-12 flex border-t border-slate-200 pt-6 dark:border-slate-800">
            {previousPage && (
              <div>
                <dt className="font-display text-sm font-medium text-slate-900 dark:text-white">
                  Previous
                </dt>
                <dd className="mt-1">
                  <Link
                    href={previousPage.href}
                    className="text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    <span aria-hidden="true">&larr;</span> {previousPage.title}
                  </Link>
                </dd>
              </div>
            )}
            {nextPage && (
              <div className="ml-auto text-right">
                <dt className="font-display text-sm font-medium text-slate-900 dark:text-white">
                  Next
                </dt>
                <dd className="mt-1">
                  <Link
                    href={nextPage.href}
                    className="text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    {nextPage.title} <span aria-hidden="true">&rarr;</span>
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="hidden xl:sticky xl:top-[4.5rem] xl:-mr-6 xl:block xl:h-[calc(100vh-4.5rem)] xl:flex-none xl:overflow-y-auto xl:py-16 xl:pr-6">
          <nav aria-labelledby="on-this-page-title" className="w-56">
            {tableOfContents.length > 0 && (
              <>
                <h2
                  id="on-this-page-title"
                  className="font-display text-sm font-medium text-slate-900 dark:text-white"
                >
                  Outline - <a className='text-sky-500 text-sm font-medium' href={githubLink()}>Edit in GitHub</a>
                </h2>
                <ol role="list" className="mt-4 space-y-3 text-sm">
                  {tableOfContents.map((section) => (
                    <li key={section.id}>
                      <h3>
                        <Link
                          href={`#${section.id}`}
                          className={clsx(
                            isActive(section)
                              ? 'text-sky-500'
                              : 'font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                          )}
                        >
                          {section.title}
                        </Link>
                      </h3>
                      {section.children.length > 0 && (
                        <ol
                          role="list"
                          className="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400"
                        >
                          {section.children.map((subSection) => (
                            <li key={subSection.id}>
                              <Link
                                href={`#${subSection.id}`}
                                className={
                                  isActive(subSection)
                                    ? 'text-sky-500'
                                    : 'hover:text-slate-600 dark:hover:text-slate-300'
                                }
                              >
                                {subSection.title}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}
