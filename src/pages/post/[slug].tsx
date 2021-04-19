import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { IconContext } from 'react-icons';
import { AiOutlineCalendar } from 'react-icons/ai';
import { BsPerson } from 'react-icons/bs';
import { FiClock } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { ExitPreviewBtn } from '../../components/ExitPreviewBtn';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  preview: boolean;
  prevPost: Post;
  nextPost: Post;
}

export default function Post({
  post,
  preview,
  prevPost,
  nextPost,
}: PostProps): JSX.Element {
  const [lastPublication, setLastPublication] = useState(
    post.last_publication_date
  );
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', true);
    script.setAttribute('repo', 'luizaacampos/spacetraveling-desafioIgnite');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-light');
    anchor.appendChild(script);
  }, []);

  const headingWords = post.data.content.reduce((acc, words) => {
    if (words.heading) {
      return [...acc, ...words.heading.split(' ')];
    }
  }, []);

  const bodyWords = RichText.asText(
    post.data.content.reduce((acc, words) => [...acc, ...words.body], [])
  ).split(' ').length;

  const readingTime = Math.ceil((bodyWords + headingWords.length) / 200);

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const lastPublicationFormatted = format(
    new Date(lastPublication),
    'dd MMM yyyy HH:mm',
    {
      locale: ptBR,
    }
  );

  return (
    <>
      <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
        <Head>
          <title>{post.data.title} | spacetraveling</title>
        </Head>
        <Header />
        <img
          className={styles.banner}
          src={post.data.banner.url}
          alt="banner"
        />
        {preview && <ExitPreviewBtn />}
        <div className={commonStyles.container}>
          <article className={`${styles.post} ${commonStyles.postsContainer}`}>
            <h1>{post.data.title}</h1>
            <div className={styles.info}>
              <AiOutlineCalendar size="1.25rem" />
              <time>{formattedDate}</time>
              <BsPerson size="1.25rem" />
              <span>{post.data.author}</span>
              <FiClock size="1.25rem" />
              <span>{readingTime} min</span>
            </div>
            {lastPublication && (
              <p className={styles.lastEdition}>
                *editado em {lastPublicationFormatted}
              </p>
            )}
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

          {prevPost ? (
            <div className={styles.neighborPosts}>
              <Link href={`/post/${prevPost?.uid}`}>
                <a>
                  <div className={styles.neighborPrevPost}>
                    <h3 className={styles.neighborPostName}>
                      {prevPost?.data.title}
                    </h3>
                    <h3 className={styles.neighborPostIndicator}>
                      Post anterior
                    </h3>
                  </div>
                </a>
              </Link>

              {nextPost && (
                <Link href={`/post/${nextPost?.uid}`}>
                  <a>
                    <div className={styles.neighborNextPost}>
                      <h3 className={styles.neighborPostName}>
                        {nextPost?.data.title}
                      </h3>
                      <h3 className={styles.neighborPostIndicator}>
                        Próximo post
                      </h3>
                    </div>
                  </a>
                </Link>
              )}
            </div>
          ) : (
            <div className={styles.onlyNext}>
              <Link href={`/post/${nextPost?.uid}`}>
                <a>
                  <div className={styles.neighborNextPost}>
                    <h3 className={styles.neighborPostName}>
                      {nextPost?.data.title}
                    </h3>
                    <h3 className={styles.neighborPostIndicator}>
                      Próximo post
                    </h3>
                  </div>
                </a>
              </Link>
            </div>
          )}
        </div>
        <div id="inject-comments-for-uterances" />
      </IconContext.Provider>
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const prevResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: response?.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: response?.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const prevPost = prevResponse?.results[0] || null;
  const nextPost = nextResponse?.results[0] || null;

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
      preview,
      prevPost,
      nextPost,
    },
    revalidate: 60 * 30, // 30 minutos
  };
};
