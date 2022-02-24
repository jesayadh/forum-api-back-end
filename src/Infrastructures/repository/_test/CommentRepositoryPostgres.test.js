const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
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

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when threadId not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableThread('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when threadId available', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' }); // memasukan thread baru dengan threadId thread-123
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableThread('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
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


    describe('checkAvailabilityComment function', () => {
      it('should throw NotFoundError if comment not available', async () => {
        // Arrange
        const commentRepository = new CommentRepositoryPostgres(pool);
        const comment = 'comment';
  
        // Action & Assert
        await expect(commentRepository.checkAvailabilityComment(comment))
          .rejects.toThrow(NotFoundError);
      });
  
      it('should not throw NotFoundError if comment available', async () => {
        // Arrange
        const commentRepository = new CommentRepositoryPostgres(pool);
        const content = 'content';
        await CommentsTableTestHelper.addComment(content);
  
        // Action & Assert
        await expect(commentRepository.checkAvailabilityComment("comment-123"))
          .resolves.not.toThrow(NotFoundError);
      });
    });

    describe('deleteComment', () => {
      it('should delete comment from database', async () => {
        // Arrange
        const commentRepository = new CommentRepositoryPostgres(pool);
        const comment = 'comment';
        await CommentsTableTestHelper.addComment(comment);
  
        // Action
        await commentRepository.deleteComment(comment);
  
        // Assert
        const comments = await CommentsTableTestHelper.findCommentsById(comment);
        expect(comments).toHaveLength(0);
      });
    });
  });
});
