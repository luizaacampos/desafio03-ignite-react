import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

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

export default function Post({ post }: PostProps) {
  <>
    <Header />
    <main>
      <article>
        <img src={post.data.banner.url} alt="banner" />
        <h1>{post.data.title}</h1>
        <time>{post.first_publication_date}</time>
        <span>{post.data.author}</span>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </main>
  </>;
}

export const getStaticPaths: GetStaticPaths = async () => {
//   return {
//     paths: [],
//     fallback: 'true',
//   };
// };

export const getStaticProps: GetStaticProps = async ({ params }) => {
//   const { slug } = params;

//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID('posts', String(slug), {});

//   const post = {
//     slug: response.uid,
//     first_publication_date: response.first_publication_date,
//     data: {
//       title: response.data.title,
//       banner: {
//         url: response.data.banner.url,
//       },
//       author: response.data.author,
//       content: response.data.content,
//     },
//   };

//   console.log(post)

//   return {
//     props: {
//       post,
//     },
    // redirect: 60 * 30, // 30 minutos
//   };
// };
