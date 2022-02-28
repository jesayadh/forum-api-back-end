const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const RegisterComment = require('../../../Domains/comments/entities/RegisterComment');
const RegisteredComment = require('../../../Domains/comments/entities/RegisteredComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist register comment and return registered comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
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
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
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

    describe('verifyAvailableComment function', () => {
      it('should throw NotFoundError if comment not available', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ username: 'dicoding' });
        await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
        const commentRepository = new CommentRepositoryPostgres(pool);
        const comment = 'comment';
  
        // Action & Assert
        await expect(commentRepository.verifyAvailableComment(comment))
          .rejects.toThrow(NotFoundError);
      });
  
      it('should not throw NotFoundError if comment available', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ username: 'dicoding' });
        await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
        const commentRepository = new CommentRepositoryPostgres(pool);
        const content = 'content';
        await CommentsTableTestHelper.addComment(content);
  
        // Action & Assert
        await expect(commentRepository.verifyAvailableComment("comment-123"))
          .resolves.not.toThrow(NotFoundError);
      });
    });

    
    describe('verifyCommentOwner function', () => {
      it('should throw AuthorizationError if comment not available', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        const commentRepository = new CommentRepositoryPostgres(pool);
        const comment = 'comment-123';
        await CommentsTableTestHelper.addComment({owner:'user-123'});
  
        // Action & Assert
        await expect(commentRepository.verifyCommentOwner(comment,"user-234"))
          .rejects.toThrow(AuthorizationError);
      });
  
      it('should not throw AuthorizationError if comment available', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
        const commentRepository = new CommentRepositoryPostgres(pool);
        const content = 'content';
        await CommentsTableTestHelper.addComment(content);
  
        // Action & Assert
        await expect(commentRepository.verifyCommentOwner("comment-123","user-123"))
          .resolves.not.toThrow(AuthorizationError);
      });
    });

    describe('getComments', () => {
      it('should get comment from database', async () => {
        await UsersTableTestHelper.addUser({ username: 'dicoding' });
        const commentRepository = new CommentRepositoryPostgres(pool);
        const thread = 'thread-123';
        await ThreadsTableTestHelper.addThread({id:thread});
        await CommentsTableTestHelper.addComment(thread);
  
        const comments = await commentRepository.getComments(thread);
  
        expect(comments).toHaveLength(1);
      });
    });

    describe('deleteComment', () => {
      it('should delete comment from database', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ username: 'dicoding' });
        await ThreadsTableTestHelper.addThread({ title: 'dicoding' });
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
