import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PriorityItem {
	dotLabel: string;
	id: string;
	label: string;
}

interface SortablePriorityProps {
	items: PriorityItem[];
	onReorder: (newOrder: string[]) => void;
}

function SortableCard({ item }: { item: PriorityItem }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

	return (
		<div
			className={`flex cursor-grab items-center gap-md rounded-md border-2 border-border bg-surface p-md active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			{...attributes}
			{...listeners}
		>
			<span className="text-lg text-text-muted">⠿</span>
			<span className="flex-1 font-semibold text-accent">{item.label}</span>
			<span className="rounded-sm bg-accent/10 px-sm py-2xs text-text-muted text-xs">{item.dotLabel}</span>
		</div>
	);
}

export function SortablePriority({ items, onReorder }: SortablePriorityProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = items.findIndex((i) => i.id === active.id);
		const newIndex = items.findIndex((i) => i.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		const newItems = [...items];
		const [removed] = newItems.splice(oldIndex, 1);
		newItems.splice(newIndex, 0, removed);
		onReorder(newItems.map((i) => i.id));
	};

	return (
		<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
			<SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
				<div className="space-y-sm">
					{items.map((item, idx) => (
						<div key={item.id}>
							<p className="m-0 mb-2xs text-center text-text-dim text-xs uppercase">
								{idx === 0 ? "Primary" : idx === 1 ? "Secondary" : "Tertiary"}
							</p>
							<SortableCard item={item} />
						</div>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
