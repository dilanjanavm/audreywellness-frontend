export const kanbanUsers = [
  {
    id: 'anna-adame',
    name: 'Anna Adame',
    role: 'Product Manager',
    avatar: 'avatar-1.jpg',
  },
  {
    id: 'frank-hook',
    name: 'Frank Hook',
    role: 'Lead Developer',
    avatar: 'avatar-3.jpg',
  },
  {
    id: 'alexis-clarke',
    name: 'Alexis Clarke',
    role: 'UI/UX Designer',
    avatar: 'avatar-6.jpg',
  },
  {
    id: 'herbert-stokes',
    name: 'Herbert Stokes',
    role: 'QA Engineer',
    avatar: 'avatar-2.jpg',
  },
  {
    id: 'michael-morris',
    name: 'Michael Morris',
    role: 'Full Stack Developer',
    avatar: 'avatar-7.jpg',
  },
  {
    id: 'nancy-martino',
    name: 'Nancy Martino',
    role: 'Web Designer',
    avatar: 'avatar-5.jpg',
  },
  {
    id: 'thomas-taylor',
    name: 'Thomas Taylor',
    role: 'Frontend Developer',
    avatar: 'avatar-8.jpg',
  },
  {
    id: 'tonya-noble',
    name: 'Tonya Noble',
    role: 'Project Manager',
    avatar: 'avatar-10.jpg',
  },
];

export const findKanbanUser = (id) => kanbanUsers.find((user) => user.id === id);

