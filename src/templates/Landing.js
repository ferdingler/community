import {graphql} from 'gatsby'
import {Layout, Card, List, Nav, Hero, Button, Text} from '~/components'
import {
  TABLET_BREAKPOINT,
  LAPTOP_BREAKPOINT,
  DESKTOP_BREAKPOINT,
  MONITOR_BREAKPOINT,
  VIOLETTE,
  ORANGE,
} from '~/constants'
import {mapNodeToProps, extract} from '~/utilities'
import {IoMdPeople, IoIosJournal} from 'react-icons/io'
import {css} from '@emotion/core'
import logoLightURI from '~/assets/images/logo-light.svg'
import {map} from 'ramda'

export const pageQuery = graphql`
  query($currentDate: Date) {
    upcomingEvents: allMarkdownRemark(
      filter: {fields: {category: {eq: "events"}, date: {gt: $currentDate}}}
      sort: {fields: [fields___date], order: ASC}
      limit: 5
    ) {
      edges {
        node {
          ...Event
          frontmatter {
            avatar {
              ...AvatarSmall
            }
          }
        }
      }
    }

    upcomingEventsCount: allMarkdownRemark(
      filter: {fields: {category: {eq: "events"}, date: {gt: $currentDate}}}
    ) {
      totalCount
    }

    latestPosts: allMarkdownRemark(
      filter: {fields: {category: {eq: "posts"}}}
      sort: {fields: [fields___date], order: DESC}
      limit: 3
    ) {
      edges {
        node {
          ...Post
          fields {
            authors {
              frontmatter {
                avatar {
                  ...AvatarMedium
                }
              }
            }
          }
        }
      }
    }

    postsCount: allMarkdownRemark(filter: {fields: {category: {eq: "posts"}}}) {
      totalCount
    }

    featuredContributors: allMarkdownRemark(
      filter: {fields: {category: {eq: "contributors"}}}
      limit: 5
    ) {
      edges {
        node {
          ...Contributor
          frontmatter {
            avatar {
              ...AvatarLarge
            }
          }
        }
      }
    }

    contributorsCount: allMarkdownRemark(
      filter: {fields: {category: {eq: "contributors"}}}
    ) {
      totalCount
    }
  }
`

const heroProps = {
  heading: 'AWS Amplify Community',
  subheading: 'A place to share projects, events, articles and other resources',
  background: ORANGE,
  textColor: '#fff',
}

const navProps = {
  beforeScroll: {
    backgroundColor: ORANGE,
    textColor: '#fff',
    logoSrc: logoLightURI,
  },
}

export default props => {
  const extractEdges = alias =>
    extract.fromPath(['data', alias, 'edges'], props)

  const [upcomingEventNodes, latestPostNodes, featuredContributorNodes] = map(
    extractEdges,
    ['upcomingEvents', 'latestPosts', 'featuredContributors'],
  )

  const extractCount = aliasPrefix =>
    extract.fromPath(['data', `${aliasPrefix}Count`, 'totalCount'], props)

  const [upcomingEventsCount, postsCount, contributorsCount] = map(
    extractCount,
    ['upcomingEvents', 'posts', 'events'],
  )

  const sections = [
    {
      heading: 'Upcoming Events',
      cta: {
        children: 'Add an Event',
        to: '/events/new',
      },
      nodes: upcomingEventNodes,
      Template: Card.Event,
      more: {
        Template: Card.ViewAll.Events,
        heading: 'View All Events',
        subheading: `${upcomingEventsCount} upcoming events`,
        to: '/events',
      },
      columnCountByBreakpoint: {
        [LAPTOP_BREAKPOINT]: 2,
        [DESKTOP_BREAKPOINT]: 3,
      },
    },
    {
      heading: 'Latest Posts',
      cta: {
        children: 'Add a Post',
        to: '/posts/new',
      },
      nodes: latestPostNodes,
      Template: Card.Post,
      more: {
        Template: Card.ViewAll.PostsOrContributors,
        graphic: <IoIosJournal size={50} />,
        heading: 'View All Posts',
        subheading: `${postsCount} posts and counting`,
        to: '/posts',
      },
      columnCountByBreakpoint: {
        [TABLET_BREAKPOINT]: 2,
        [DESKTOP_BREAKPOINT]: 4,
      },
      cardContainerStyles: css`
        background-color: ${VIOLETTE};
        * {
          color: #fff;
        }
      `,
    },
    {
      heading: 'Featured Contributors',
      cta: {
        children: 'Join The Community',
        to: '/participate',
      },
      nodes: featuredContributorNodes,
      Template: Card.Contributor,
      more: {
        Template: Card.ViewAll.PostsOrContributors,
        graphic: <IoMdPeople size={60} />,
        heading: 'All Contributors',
        subheading: `See all ${contributorsCount} members of our community`,
        to: '/contributors',
      },
      columnCountByBreakpoint: {
        [TABLET_BREAKPOINT]: 3,
        [MONITOR_BREAKPOINT]: 6,
      },
    },
  ]

  const main = map(
    ({
      heading,
      key,
      cta,
      nodes,
      Template,
      more,
      cardContainerStyles,
      ...rest
    }) => {
      const {Template: ViewAllCard, ...viewAllProps} = more

      const items = [
        ...map(
          node => (
            <Template
              containerStyles={cardContainerStyles}
              {...mapNodeToProps(node)}
            />
          ),
          nodes,
        ),
        <ViewAllCard {...viewAllProps} />,
      ]

      return (
        <List
          key={heading}
          heading={<Text listHeading>{heading}</Text>}
          cta={(
            <Button.Basic
              styles={css`
                border-radius: 20px;
                background-color: ${ORANGE};
                padding-right: 16px;
                padding-left: 16px;
                > * {
                  color: #fff;
                }
              `}
              {...cta}
              landingListCta
            />
)}
          {...{key, items}}
          {...rest}
        />
      )
    },
    sections,
  )

  return (
    <Layout.Basic
      header={[<Nav {...navProps} />, <Hero {...heroProps} />]}
      {...{main}}
    />
  )
}
