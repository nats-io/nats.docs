# Synadia's NGS

So now that you are using NATS in your application, you are going to need a NATS infrastructure for the instances of your applications to use.

The simplest thing to do is actually not to even bother with setting up, running and monitoring your own NATS service but rather to simply use [NGS](https://synadia.com/ngs/pricing), [Synadia](https://synadia.com)'s NATS as a Service offering.

One way to explain what NGS is, is to draw an analogy to something everyone is familiar with: the Internet. NGS is the 'Internet' of NATS, the "InterNATS" if you want, and Synadia is an 'InterNATS Service Provider', meaning that NGS is a globally distributed super-cluster of nats server clusters that offers NATS connectivity and JetStream support.

* Just like with an Internet connection where you can plug in your own router to extend Internet service to a private intranet, you can run your own  'Leaf Node `nats-server`` (or even a cluster of them) on your own VPC, network, servers, etc...  which will act as local servers and for your NATS client applications and connect you to the rest of your applications or leaf nodes over NGS.


* When you sign up for NGS service you get an 'Account' that you can then use to create/authorize/revoke 'Users' credentials that are all your applications need in order to connect to NGS securely.
  * Just like with a VPN, each account has its own isolated subject name space, meaning that by default only of the users for your account can see their publications (according to their authorizations).
  * You, the account key-holder, completely and independently control and manage your users and their authorizations
  * NGS never ever stores any Account or User private keys, only _you_ have them (keep them safe!)
  * Just like with Firewalls you precisely control which subjects and services you want to import or export with other accounts
  * Just like with Network Address Translation you can map subject names for messages as they are imported into your account


* Just like a global ISP or a global Telco, Synadia runs and maintains NGS globally, with over a dozen of clusters spanning all regions and cloud providers and providing a truly global service, client connections are automatically directed to the closest cluster.

## Creating an Account on NGS

You can start by creating a developer account which is *free* and doesn't even require a credit card:

* [Install NSC and get an NGS account](https://synadia.com/ngs/signup)

You can then follow the instructions to obtain your NGS account, and create the first of any number of users and user authorizations you want and distribute those user credentials to use with your applications.

## Connecting to NGS

Your isolated applications can connect directly to NGS, or if you have more than one process running in the same location they would connect to NGS through a Leaf Node nats server that you would deploy locally and that would act as a 'local router' and proxy for the local applications to NGS. Those client applications (and the Leaf Node nats servers if used) only need to use "nats://connect.ngs.global" or "tls://connect.ngs.global" as the connection URL and the user's credential file which contains both the private key and the JTW to the user.