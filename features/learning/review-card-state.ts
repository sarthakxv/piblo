export interface ReviewCardState {
    revealedIds: ReadonlySet<string>;
    exploredIds: ReadonlySet<string>;
}

export function createReviewCardState(): ReviewCardState {
    return {
        revealedIds: new Set<string>(),
        exploredIds: new Set<string>(),
    };
}

export function toggleReviewCard(
    state: ReviewCardState,
    cardId: string,
): ReviewCardState {
    const revealedIds = new Set(state.revealedIds);
    const exploredIds = new Set(state.exploredIds);

    if (!revealedIds.delete(cardId)) revealedIds.add(cardId);
    exploredIds.add(cardId);

    return { revealedIds, exploredIds };
}
