import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

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

export default function Post() {
  <>
    <main>
      <article>
        <h1>{post.title}</h1>
        <time>{post.updatedAt}</time>
        <div dangerouslySetInnerHTML={{__html:post.content}} />
      </article>
    </main>
  </>
}

export const getStaticPaths = async ({ params }) => {
  const {slug } = params

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {})

  response.first_publication_date = format(
    new Date(response.first_publication_date),
    'dd MMM yyyy',
  ).toLowerCase()

  return {
    props: {
      post: response
    }
  }

  // const posts = await prismic.query([
  //   Prismic.predicates.at('document.type', 'post')
  // ], {
  //   fetch: ['post.title', 'post.content']
  // });

  
};

// export const getStaticProps = async context => {
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID('post', String(slug), {});

//   const post = {
//     slug,
//     title: RichText.asText(response.data.title),
//     content: RichText.asHtml(response.data.content),
//     updatedAt: 
//   }
// };
