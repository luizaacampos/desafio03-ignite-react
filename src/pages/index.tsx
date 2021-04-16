import { GetStaticProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { AiOutlineCalendar } from 'react-icons/ai';
import { BsPerson } from 'react-icons/bs';
import { IconContext } from 'react-icons/lib';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { ExitPreviewBtn } from '../components/ExitPreviewBtn';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleLoadMore(): Promise<void> {
    if (postsPagination.next_page === null) {
      return;
    }
    const newPosts = await fetch(nextPage).then(response => response.json());

    setNextPage(newPosts.next_page);

    const morePosts: Post[] = newPosts.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...morePosts]);
  }

  return (
    <>
      <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
        <Head>
          <title>Home | spacetraveling</title>
        </Head>
        <Header />
        {preview && <ExitPreviewBtn />}

        <main className={commonStyles.container}>
          <div className={`${styles.posts} ${commonStyles.postsContainer}`}>
            {posts.map(post => (
              <Link href={`/post/${post.uid}`}>
                <a key={post?.uid}>
                  <strong>{post?.data?.title}</strong>
                  <p>{post?.data?.subtitle}</p>
                  <AiOutlineCalendar size="1.5rem" />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <BsPerson size="1.5rem" />
                  <span>{post?.data?.author}</span>
                </a>
              </Link>
            ))}
            {nextPage && (
              <button type="button" onClick={handleLoadMore}>
                Carregar mais posts
              </button>
            )}
          </div>
        </main>
      </IconContext.Provider>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const postResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postResponse.results.map((post: Post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const nextPage = postResponse.next_page;

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: nextPage,
      },
      preview,
    },
  };
};
