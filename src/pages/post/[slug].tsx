import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { AiOutlineCalendar } from 'react-icons/ai';
import { BsPerson } from 'react-icons/bs';
import { FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  const readingTime = post?.data.content.reduce((acc, content) => {
    const text = `${content.heading} ${RichText.asText(content.body)}`;

    return Math.ceil(text.split(' ').length / 200);
  }, 0);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />
      <img className={styles.banner} src={post.data.banner.url} alt="banner" />
      <div className={commonStyles.container}>
        <article className={`${styles.post} ${commonStyles.postsContainer}`}>
          <h1>{post.data.title}</h1>
          <AiOutlineCalendar size="1.5rem" />
          <time>{post.first_publication_date}</time>
          <BsPerson size="1.5rem" />
          <span>{post.data.author}</span>
          <FiClock size="1.5rem" />
          <span>{readingTime} min</span>
          <div className={styles.content}>
            {post.data.content.map(({ heading, body }) => (
              <div key={heading}>
                <h3>{heading}</h3>
                <div
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
                />
              </div>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: RichText.asText(response.data.title),
      banner: response.data.banner,
      author: RichText.asText(response.data.author),
      content: response.data.content,
    },
  };

  // const readingTime = response.data.content.reduce((total, content) => {
  //   let counter = 0
  //   content.map(word => {
  //     counter += RichText.asText([word]).split('').length
  //   })
  //   return total + counter
  // }, 0)

  return {
    props: {
      post,
      // readingTime: Math.round(readingTime / 200)
    },
    revalidate: 60 * 30, // 30 minutos
  };
};
