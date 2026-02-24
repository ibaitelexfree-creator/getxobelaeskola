const token = 'vcp_5RYMTFTtIVRKsN7lcUt7Om9oGgDgJeyA8kzFvS5U5mgplUpsKf348WlB';
fetch('https://api.vercel.com/v9/projects', { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => {
        if (data.projects && data.projects.length > 0) {
            console.log('Project ID:', data.projects[0].id);
            console.log('Project Name:', data.projects[0].name);
            console.log('Project Account/Team ID:', data.projects[0].accountId);

            fetch(`https://api.vercel.com/v5/projects/${data.projects[0].id}/usage?teamId=${data.projects[0].accountId}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.json())
                .then(usage => console.log('Usage Data:', JSON.stringify(usage, null, 2)))
                .catch(e => console.error('Usage Error:', e));

        } else {
            console.log('Data:', data);
        }
    }).catch(e => console.error(e));
