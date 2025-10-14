import random

def generate_poem(topic: str, style: str = 'free verse', lines: int = 8) -> str:
    openings = [
        f"In the hush of {topic}, something stirs",
        f"{topic.title()} drifts through the morning light",
        f"Among whispers of {topic}, a thought unfolds"
    ]
    middles = [
        "footsteps echo like small ideas",
        "a question hums beneath the air",
        "shadows trace invisible patterns",
        "time folds softly at the edges"
    ]
    closers = [
        "and silence blooms again.",
        "so the night learns to listen.",
        "until the world forgets its weight."
    ]
    poem = [random.choice(openings)]
    for _ in range(max(2, lines - 2)):
        poem.append(random.choice(middles))
    poem.append(random.choice(closers))
    return "\n".join(poem)
