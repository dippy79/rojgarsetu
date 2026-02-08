import Link from 'next/link'
import useSWR from 'swr'
import { fetcher } from '../lib/api'

function Home() {
  const { data: jobs } = useSWR('/jobs?lang=en', fetcher)
  const { data: courses } = useSWR('/courses?lang=en', fetcher)

  return (
    <div style={{padding:20}}>
      <h1>RojgarSetu</h1>
      <section>
        <h2>Jobs</h2>
        {jobs && jobs.map(j=> (
          <div key={j.id}><Link href={`/jobs/${j.id}`}>{j.title}</Link></div>
        ))}
      </section>
      <section>
        <h2>Courses</h2>
        {courses && courses.map(c=> (
          <div key={c.id}><Link href={`/courses/${c.id}`}>{c.name}</Link></div>
        ))}
      </section>
    </div>
  )
}

export default Home
