const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RegisterComment = require('../../../Domains/comments/entities/RegisterComment');
const RegisteredComment = require('../../../Domains/comments/entities/RegisteredComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist register comment and return registered comment correctly', async () => {
      // Arrange
      const registerComment = new RegisterComment({
        content: 'dicoding',
        threadId:'thread-123',
        owner:'user-123'
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(registerComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return registered comment correctly', async () => {
      // Arrange
      const registerComment = new RegisterComment({
        content: 'dicoding',
        threadId:'thread-123',
        owner:'user-123'
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredComment = await commentRepositoryPostgres.addComment(registerComment);

      // Assert
      expect(registeredComment).toStrictEqual(new RegisteredComment({
        id: 'comment-123',
        content: 'dicoding',
        owner: 'user-123',
      }));
    });
  });
});
