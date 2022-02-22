const RegisterComment = require('../../../Domains/comments/entities/RegisterComment');
const RegisteredComment = require('../../../Domains/comments/entities/RegisteredComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'dicoding',
      threadId: 'thread-123',
      owner: 'user-123',
    };
    const expectedRegisteredComment = new RegisteredComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedRegisteredComment));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const registeredComment = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(registeredComment).toStrictEqual(expectedRegisteredComment);
    expect(mockCommentRepository.addComment).toBeCalledWith(new RegisterComment({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    }));
  });
});
